const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { make, model, yearFrom, yearTo, fuel } = await req.json();

    if (!make || !model) {
      return new Response(
        JSON.stringify({ success: false, error: 'Make and model are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Finn.no JSON API for structured data
    const params = new URLSearchParams();
    params.set('searchkey', 'SEARCH_ID_CAR_USED');
    params.set('sort', 'PUBLISHED_DESC');
    params.set('q', `${make} ${model}`.trim());
    params.set('vertical', 'car');
    params.set('sub_vertical', 'used');

    if (yearFrom) params.set('year_from', String(yearFrom));
    if (yearTo) params.set('year_to', String(yearTo));

    const searchUrl = `https://www.finn.no/api/search-qf?${params.toString()}`;
    console.log('Searching Finn.no API:', searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Search failed: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const docs = data.docs || [];

    const modelLower = model.toLowerCase();
    const listings = docs
      .filter((doc: any) => {
        const docModel = (doc.model || '').toLowerCase();
        return docModel === modelLower && doc.price?.amount > 10000;
      })
      .slice(0, 15)
      .map((doc: any) => ({
        title: doc.heading || `${make} ${model}`,
        price: doc.price?.amount || 0,
        year: String(doc.year || ''),
        mileage: doc.mileage ? `${doc.mileage.toLocaleString('nb-NO')} km` : '',
        fuel: doc.fuel || '',
        gearbox: doc.transmission || doc.gearbox || '',
        finnCode: String(doc.id || doc.ad_id || ''),
        url: doc.canonical_url || `https://www.finn.no/mobility/item/${doc.id}`,
        location: doc.location || '',
      }));

    console.log(`Found ${listings.length} similar listings`);
    // Debug: log raw doc keys to find drivetrain field
    if (docs.length > 0) {
      const sample = docs[0];
      console.log('Sample doc keys:', Object.keys(sample).join(', '));
      console.log('Sample doc partial:', JSON.stringify({
        transmission: sample.transmission, gearbox: sample.gearbox,
        wheel_drive: sample.wheel_drive, drivetrain: sample.drivetrain,
        drive: sample.drive, four_wheel_drive: sample.four_wheel_drive,
      }));
    }

    // Calculate stats
    const prices = listings.map((l: any) => l.price).filter((p: number) => p > 0);
    const stats = prices.length > 0 ? {
      count: prices.length,
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length),
      median: prices.sort((a: number, b: number) => a - b)[Math.floor(prices.length / 2)],
    } : null;

    return new Response(
      JSON.stringify({ success: true, data: { listings, stats } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error searching:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Search failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
