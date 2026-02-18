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

    // Build Finn.no search URL
    const params = new URLSearchParams();
    params.set('search_type', 'SEARCH_ID_CAR_USED');
    params.set('sort', 'PUBLISHED_DESC');
    
    // Use body_search for make+model
    const query = `${make} ${model}`.trim();
    params.set('q', query);
    
    if (yearFrom) params.set('year_from', String(yearFrom));
    if (yearTo) params.set('year_to', String(yearTo));
    if (fuel) {
      const fuelMap: Record<string, string> = {
        'Diesel': '2',
        'Bensin': '1',
        'Elektrisk': '4',
        'Hybrid': '3',
        'Plugg-inn hybrid': '7',
      };
      if (fuelMap[fuel]) params.set('fuel', fuelMap[fuel]);
    }

    const searchUrl = `https://www.finn.no/mobility/search/car?${params.toString()}`;
    console.log('Searching Finn.no:', searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'nb-NO,nb;q=0.9,no;q=0.8',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Search failed: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();

    // Extract listings from search results
    // Finn.no search results contain ad cards with prices and details
    const listings: { title: string; price: number; year: string; mileage: string; finnCode: string; url: string }[] = [];

    // Match ad items - look for price and title patterns in search results
    // Finn uses structured data and specific patterns for their cards
    const adBlocks = html.split(/data-testid="(?:ad-card|result-item)"/gi);
    
    for (let i = 1; i < adBlocks.length && listings.length < 10; i++) {
      const block = adBlocks[i];
      
      // Extract finn code from link
      const linkMatch = block.match(/\/mobility\/item\/(\d+)/);
      if (!linkMatch) continue;
      
      const finnCode = linkMatch[1];
      
      // Extract title
      const titleMatch = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || 
                         block.match(/<a[^>]*aria-label="([^"]+)"/);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';
      
      // Extract price - look for kr pattern
      const priceMatch = block.match(/([\d\s]+)\s*kr/);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, '')) : 0;
      
      // Extract year
      const yearMatch = block.match(/\b(19|20)\d{2}\b/);
      const year = yearMatch ? yearMatch[0] : '';
      
      // Extract mileage
      const mileageMatch = block.match(/([\d\s]+)\s*km/i);
      const mileage = mileageMatch ? mileageMatch[1].trim() + ' km' : '';

      if (price > 0 && title) {
        listings.push({
          title,
          price,
          year,
          mileage,
          finnCode,
          url: `https://www.finn.no/mobility/item/${finnCode}`,
        });
      }
    }

    // Fallback: try a different pattern if no results found
    if (listings.length === 0) {
      const itemMatches = [...html.matchAll(/\/mobility\/item\/(\d+)/g)];
      const uniqueCodes = [...new Set(itemMatches.map(m => m[1]))];
      
      // Extract all prices from the page
      const allPrices = [...html.matchAll(/([\d\s]{4,})\s*kr/g)];
      
      for (let i = 0; i < Math.min(uniqueCodes.length, allPrices.length, 10); i++) {
        const price = parseInt(allPrices[i][1].replace(/\s/g, ''));
        if (price > 10000 && price < 5000000) {
          listings.push({
            title: `${make} ${model}`,
            price,
            year: '',
            mileage: '',
            finnCode: uniqueCodes[i],
            url: `https://www.finn.no/mobility/item/${uniqueCodes[i]}`,
          });
        }
      }
    }

    console.log(`Found ${listings.length} similar listings`);

    // Calculate stats
    const prices = listings.map(l => l.price).filter(p => p > 0);
    const stats = prices.length > 0 ? {
      count: prices.length,
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      median: prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)],
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
