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
    
    const query = `${make} ${model}`.trim();
    params.set('q', query);
    
    if (yearFrom) params.set('year_from', String(yearFrom));
    if (yearTo) params.set('year_to', String(yearTo));
    if (fuel) {
      const fuelMap: Record<string, string> = {
        'Diesel': '2',
        'Bensin': '1',
        'Elektrisk': '4',
        'El': '4',
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

    const listings: { title: string; subtitle: string; price: number; year: string; mileage: string; finnCode: string; url: string; location: string }[] = [];

    // Strategy: Find each listing link (/mobility/item/CODE), then scan forward
    // in the HTML to find the price that belongs to that specific listing block.
    // Finn.no structures results as blocks where the link and price are close together.
    
    // Find all item links with their positions
    const linkPattern = /href="https:\/\/www\.finn\.no\/mobility\/item\/(\d+)"/g;
    const linkMatches: { code: string; index: number }[] = [];
    let linkMatch;
    while ((linkMatch = linkPattern.exec(html)) !== null) {
      const code = linkMatch[1];
      // Skip duplicates (same code can appear multiple times)
      if (!linkMatches.find(m => m.code === code)) {
        linkMatches.push({ code, index: linkMatch.index });
      }
    }

    // For each link, extract the surrounding block and find price within it
    for (const item of linkMatches) {
      if (listings.length >= 15) break;

      // Take a larger chunk around the link to capture subtitle/specs
      const blockStart = Math.max(0, item.index - 1000);
      const blockEnd = Math.min(html.length, item.index + 3000);
      const block = html.substring(blockStart, blockEnd);

      // Extract title from the heading near this link
      const titleMatch = block.match(new RegExp(`item/${item.code}"[^>]*>([^<]+)`)) ||
                         block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : `${make} ${model}`;

      // Find price - look for "X kr" pattern in the block AFTER the link
      const afterLink = html.substring(item.index, item.index + 2000);
      const priceMatch = afterLink.match(/([\d\s]{3,})\s*kr/);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, '')) : 0;

      // Extract subtitle/generation – usually in a smaller element after the title
      const subtitleMatch = afterLink.match(/<(?:span|p|div)[^>]*class="[^"]*subtitle[^"]*"[^>]*>([^<]+)/i) ||
                            afterLink.match(/<h2[^>]*>[^<]*<\/h2>\s*(?:<[^>]*>)*\s*<(?:span|p|div)[^>]*>([^<]+)/i);
      const subtitle = subtitleMatch ? subtitleMatch[1].trim() : '';

      // Extract year and mileage from specs line (e.g. "2022 ∙ 75 000 km ∙ El")
      const specsMatch = afterLink.match(/(20\d{2})\s*[∙·]\s*([\d\s]+)\s*km/);
      const year = specsMatch ? specsMatch[1] : '';
      const mileage = specsMatch ? specsMatch[2].trim() + ' km' : '';

      // Extract location
      const locationMatch = afterLink.match(/([A-ZÆØÅ][a-zæøåA-ZÆØÅ\s]+)\s*[∙·]\s*(?:Sulland|Bertel|VALO|Rebil|Car4|Bayern|Møller|Bilhuset|Birger|Motor|Auto|Forhandler|Merkeforhandler)/);
      const location = locationMatch ? locationMatch[1].trim() : '';

      // Filter: only include listings that match the model name
      // Use a tighter window around the link to avoid matching neighbor listings
      const modelLower = model.toLowerCase();
      const tightBlock = html.substring(item.index, Math.min(html.length, item.index + 1500)).toLowerCase();
      const noSpaceModel = model.replace(/\s+/g, '').toLowerCase();
      const matchesModel = tightBlock.includes(modelLower) || tightBlock.includes(noSpaceModel);

      if (price > 10000 && price < 10000000 && matchesModel) {
        listings.push({
          title,
          subtitle,
          price,
          year,
          mileage,
          finnCode: item.code,
          url: `https://www.finn.no/mobility/item/${item.code}`,
          location,
        });
      }
    }

    console.log(`Found ${listings.length} similar listings`);
    
    // Log first few for debugging
    for (const l of listings.slice(0, 3)) {
      console.log(`  ${l.finnCode}: ${l.title} - ${l.price} kr`);
    }

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
