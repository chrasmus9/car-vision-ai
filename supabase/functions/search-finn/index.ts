const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Known trim/variant names across common car brands
const KNOWN_TRIMS = [
  // Generic
  'active', 'allure', 'ambition', 'business', 'comfort', 'cosmo', 'edition',
  'elegance', 'elite', 'exclusive', 'executive', 'expression', 'gt', 'gt-line',
  'inscription', 'limited', 'luxury', 'momentum', 'plus', 'premium', 'prestige',
  'pro', 'r-design', 'r-line', 'se', 'sel', 'sport', 'style',
  // Ford
  'st-line', 'st-line x', 'titanium', 'titanium x', 'trend', 'vignale',
  // VW
  'comfortline', 'highline', 'trendline', 'life', 'move', 'r',
  // Toyota
  'executive', 'lounge', 'club',
  // BMW
  'm sport', 'm-sport', 'xline', 'x-line', 'luxury line',
  // Mercedes
  'amg', 'amg line', 'avantgarde', 'progressive',
  // Audi
  's line', 's-line', 'advanced', 'design',
  // Volvo
  'summum', 'kinetic', 'core', 'ultimate',
  // Hyundai/Kia
  'teknikk', 'teknikkpakke', 'advanced',
  // Peugeot
  'gt line', 'gt-line',
  // Skoda
  'ambition', 'style', 'sportline', 'l&k', 'laurin & klement',
];

// Known engine/drivetrain keywords to keep as variant info
const ENGINE_PATTERNS = [
  /\b\d[.,]\d\s*(t|tdi|tsi|tfsi|hdi|cdti|crdi|jtd|tdci|dci|mpi|gdi|e-hybrid|phev|hybrid|ev|ecoboost|skyactiv|multijet|bluehdi|puretech)\b/i,
  /\b(phev|bev|mhev|hev|plug-?in|e-?hybrid|hybrid|electric)\b/i,
  /\b(awd|4wd|4x4|4motion|xdrive|quattro|4matic)\b/i,
  /\b(\d{2,3})\s*(hk|hp|kw|ps)\b/i,
];

// Words/patterns to filter OUT (equipment, marketing, features)
const NOISE_PATTERNS = [
  /\b(acc|led|krok|hud|navi|dab\+?|r\.?kam|panorama|pano|app|b&o|b&amp;o|bose|harman|keyless|adaptive|cruise)\b/i,
  /\b(kampanje|tilbud|selges|må ses|som ny|lav km|full historikk|service|garanti|nysynet)\b/i,
  /\b(ryggekamera|parksensor|skinn|alcantara|soltak|el-?sete|sete-?varme|rat-?varme|head-?up)\b/i,
  /\b(bluetooth|carplay|android auto|apple|usb|wifi|360|kamera)\b/i,
  /\b(wltp|nedc|co2|nox|km\/l)\b/i,
  /\b(februar|mars|april|mai|juni|juli|august|september|oktober|november|desember|januar)\b/i,
  /[\/+]{2,}/,
  /^\d+$/,
];

function extractVariant(spec: string): string {
  if (!spec || spec.trim().length === 0) return '';

  const cleaned = spec.replace(/&amp;/g, '&').trim();

  // Split on common delimiters
  const parts = cleaned.split(/[\/|,]|\s{2,}/).map(p => p.trim()).filter(Boolean);

  const variantParts: string[] = [];

  for (const part of parts) {
    const lower = part.toLowerCase().trim();

    // Check if this part contains a known trim name
    const matchedTrim = KNOWN_TRIMS.find(t => {
      // Match whole word for short trims
      if (t.length <= 3) {
        return new RegExp(`\\b${t}\\b`, 'i').test(lower);
      }
      return lower.includes(t);
    });

    // Check if it's an engine/drivetrain spec
    const isEngine = ENGINE_PATTERNS.some(p => p.test(part));

    if (matchedTrim) {
      // Only extract the trim name itself, not surrounding noise
      variantParts.push(matchedTrim.toUpperCase() === matchedTrim ? matchedTrim : matchedTrim.charAt(0).toUpperCase() + matchedTrim.slice(1));
    } else if (isEngine) {
      // Extract just the engine match
      for (const pattern of ENGINE_PATTERNS) {
        const match = part.match(pattern);
        if (match) {
          variantParts.push(match[0]);
          break;
        }
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = variantParts.filter(p => {
    const key = p.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.join(' ').trim();
}

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
        subtitle: extractVariant(doc.model_specification || ''),
        price: doc.price?.amount || 0,
        year: String(doc.year || ''),
        mileage: doc.mileage ? `${doc.mileage.toLocaleString('nb-NO')} km` : '',
        finnCode: String(doc.id || doc.ad_id || ''),
        url: doc.canonical_url || `https://www.finn.no/mobility/item/${doc.id}`,
        location: doc.location || '',
      }));

    console.log(`Found ${listings.length} similar listings`);
    for (const l of listings.slice(0, 3)) {
      console.log(`  ${l.finnCode}: ${l.title} (${l.subtitle}) - ${l.price} kr`);
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
