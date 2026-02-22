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

    // Debug: log fields for drivetrain extraction
    if (docs.length > 0) {
      docs.slice(0, 3).forEach((d: any, i: number) => {
        console.log(`Doc ${i}:`, JSON.stringify({
          heading: d.heading,
          wheel_drive: d.wheel_drive,
          extras: d.extras,
          labels: d.labels,
          body_type: d.body_type,
        }));
      });
    }

    const listings = docs
      .filter((doc: any) => {
        const docModel = (doc.model || '').toLowerCase();
        return docModel === modelLower && doc.price?.amount > 10000;
      })
      .slice(0, 15)
      .map((doc: any) => {
        const heading = doc.heading || `${make} ${model}`;
        const modelSpec = doc.model_specification || '';
        const facadeTitle = doc.facade_title || '';
        const makeModel = `${make} ${model}`.trim();
        const makeModelLower = makeModel.toLowerCase();
        
        // Helper: strip make/model prefix from a string
        const stripPrefix = (s: string) => {
          const lower = s.toLowerCase();
          if (lower.startsWith(makeModelLower)) {
            return s.substring(makeModel.length).trim().replace(/^[\s,\-–]+/, '').trim();
          }
          return s.trim();
        };

        // 1. Variant: prefer model_specification subtitle, cleaned up
        let variant = '';
        if (modelSpec) {
          let cleaned = stripPrefix(modelSpec);
          // Remove everything after | (pipe separator)
          cleaned = cleaned.split(/\s*\|\s*/)[0].trim();
          // Split on / and keep only the first segment if it looks like equipment list
          const slashParts = cleaned.split(/\s*\/\s*/);
          if (slashParts.length > 2) {
            // Multiple / segments = equipment list, keep first meaningful part
            cleaned = slashParts[0].trim();
          }
          // Remove common equipment suffixes
          cleaned = cleaned.replace(/\b(hengerfeste|tilhengerfeste|krok|kamera\d*|soltak|acc|ledbar|skinn|harman|pixel|ryggelys|oppvarm|varmepumpe|ekstra|kam)\b.*$/i, '').trim();
          // Remove seller comments after ! (e.g. "Long Range ! Velholdt! Freshe dekk!")
          cleaned = cleaned.replace(/\s*!.*$/g, '').trim();
          cleaned = cleaned.replace(/[!+*\/\-–]+$/g, '').trim();
          // Remove specs like "283hk", "EU-07.2027", range info
          cleaned = cleaned.replace(/\b\d+hk\b/gi, '').trim();
          cleaned = cleaned.replace(/\bEU-\d{2}\.\d{4}\b/gi, '').trim();
          cleaned = cleaned.replace(/\b(OVER\s+)?\d+\s*KM\s+REKKEVIDDE\b/gi, '').trim();
          cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
          if (cleaned.length > 1) variant = cleaned;
        }
        if (!variant) {
          const fromTitle = stripPrefix(heading);
          if (fromTitle.length > 1) variant = fromTitle;
        }

        // 2. Drivetrain: check wheel_drive field first, then text keywords
        let drivetrain = '';
        
        // First: direct API field
        if (doc.wheel_drive) {
          drivetrain = doc.wheel_drive;
        }
        
        // Second: check extras array (Finn sometimes puts drivetrain here)
        if (!drivetrain && Array.isArray(doc.extras)) {
          const extrasStr = doc.extras.join(' ');
          if (/\b(Firehjulsdrift|4WD|AWD)\b/i.test(extrasStr)) drivetrain = 'Firehjulsdrift';
          else if (/\b(Tohjulsdrift|Bakhjulsdrift|Forhjulsdrift)\b/i.test(extrasStr)) drivetrain = 'Tohjulsdrift';
        }
        
        // Third: check title/spec text for keywords
        if (!drivetrain) {
          const searchText = `${modelSpec} ${heading} ${facadeTitle}`;
          if (/\b(AWD|4WD|xDrive|4x4|Firehjulsdrift|Firehjulstrekk|4MATIC|quattro|4motion|allgrip|e-4orce|Twin)\b/i.test(searchText)) {
            drivetrain = 'Firehjulsdrift';
          } else if (/\b(RWD|FWD|Tohjulsdrift|Bakhjulsdrift|Forhjulsdrift)\b/i.test(searchText)) {
            drivetrain = 'Tohjulsdrift';
          }
        }

        // Clean drivetrain keywords from variant
        if (variant) {
          variant = variant.replace(/\b(AWD|4WD|xDrive|4x4|4MATIC|quattro|4motion|allgrip|e-4orce|RWD|FWD|Twin)\b/gi, '').trim();
          variant = variant.replace(/\s{2,}/g, ' ').trim();
        }

        return {
          title: heading,
          price: doc.price?.amount || 0,
          year: String(doc.year || ''),
          mileage: doc.mileage ? `${doc.mileage.toLocaleString('nb-NO')} km` : '',
          sellerType: doc.dealer_segment === 'Privat' ? 'Privat' : (doc.dealer_segment ? 'Forhandler' : (doc.organisation_name ? 'Forhandler' : 'Privat')),
          finnCode: String(doc.id || doc.ad_id || ''),
          url: doc.canonical_url || `https://www.finn.no/mobility/item/${doc.id}`,
          location: doc.location || '',
          gearbox: doc.transmission || '',
          drivetrain,
          variant,
        };
      });

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
