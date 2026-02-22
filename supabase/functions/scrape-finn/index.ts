const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract finn code from URL or use directly
    let finnUrl = url.trim();
    if (/^\d+$/.test(finnUrl)) {
      finnUrl = `https://www.finn.no/mobility/item/${finnUrl}`;
    }
    if (!finnUrl.includes('finn.no')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid Finn.no URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scraping Finn.no URL:', finnUrl);

    const response = await fetch(finnUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'nb-NO,nb;q=0.9,no;q=0.8,nn;q=0.6,en;q=0.4',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch page: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();

    // Extract data from HTML using regex patterns
    const extract = (pattern: RegExp, fallback = '') => {
      const match = html.match(pattern);
      return match ? match[1].trim() : fallback;
    };

    // Try to extract JSON-LD structured data first
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    let jsonLd: any = null;
    if (jsonLdMatch) {
      try {
        jsonLd = JSON.parse(jsonLdMatch[1]);
      } catch { /* ignore */ }
    }

    // Extract title
    const title = extract(/<h1[^>]*>([\s\S]*?)<\/h1>/) || 
                  extract(/<title>(.*?)<\/title>/);

    // Extract subtitle – on Finn it's typically the element right after the h1
    const subtitleMatch = html.match(/<h1[^>]*>[\s\S]*?<\/h1>\s*(?:<[^>]*>)*\s*<(?:p|span|div)[^>]*>([\s\S]*?)<\/(?:p|span|div)>/i);
    const subtitle = subtitleMatch ? subtitleMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    // Extract description
    const descMatch = html.match(/Beskrivelse[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
    const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    // Extract the full text content for AI analysis
    const textContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000);

    // Extract images - handle both /item/CODE/UUID and /YYYY/MM/.../CODE_UUID formats
    const finnCode = finnUrl.match(/(\d{9,})/)?.[1] || '';
    
    // Pattern 1: /item/CODE/UUID (dealer listings)
    const itemImageMatches = [...html.matchAll(/images\.finncdn\.no\/dynamic\/[^"'\s]*\/item\/\d+\/([a-f0-9-]+)/g)];
    const itemImageIds = [...new Set(itemImageMatches.map(m => m[1]))];
    
    // Pattern 2: /YYYY/MM/.../CODE_UUID.ext (private seller listings)
    // Extract the path after the resolution prefix, deduplicate by UUID
    const privateImageMatches = [...html.matchAll(/images\.finncdn\.no\/dynamic\/[^"'\s]*?(\d{4}\/\d{1,2}\/[^"'\s]*?_([a-f0-9-]+)\.[a-z]+)/g)];
    const seenUuids = new Set<string>();
    const privateImagePaths: string[] = [];
    for (const m of privateImageMatches) {
      const uuid = m[2];
      if (!seenUuids.has(uuid)) {
        seenUuids.add(uuid);
        privateImagePaths.push(m[1]);
      }
    }
    
    let images: string[] = [];
    if (itemImageIds.length > 0) {
      images = itemImageIds.map(id => `https://images.finncdn.no/dynamic/1600w/item/${finnCode}/${id}`);
    } else if (privateImagePaths.length > 0) {
      images = privateImagePaths.map(p => `https://images.finncdn.no/dynamic/1600w/${p}`);
    }
    images = images.slice(0, 20);

    // Extract specs from the page
    const specsSection = html.match(/Spesifikasjoner[\s\S]*?(?=Utstyr|Beskrivelse|$)/i)?.[0] || '';
    
    const extractSpec = (label: string) => {
      const pattern = new RegExp(label + '[\\s\\S]*?<[^>]*>([^<]+)', 'i');
      const match = specsSection.match(pattern) || html.match(pattern);
      return match ? match[1].trim() : '';
    };

    const carData = {
      title: title.replace(/<[^>]*>/g, '').trim(),
      subtitle,
      url: finnUrl,
      images,
      textContent,
      specs: {
        make: extractSpec('Merke'),
        model: extractSpec('Modell(?!år)'),
        year: extractSpec('Modellår'),
        body: extractSpec('Karosseri'),
        fuel: extractSpec('Drivstoff'),
        power: extractSpec('Effekt'),
        engine: extractSpec('Slagvolum'),
        co2: extractSpec('CO₂'),
        mileage: extractSpec('Kilometerstand'),
        gearbox: extractSpec('Girkasse'),
        towWeight: extractSpec('tilhengervekt'),
        drivetrain: extractSpec('Hjuldrift'),
        weight: extractSpec('(?<!tilhenger)Vekt'),
        seats: extractSpec('Seter'),
        doors: extractSpec('Dører'),
        color: extractSpec('Farge'),
        regNr: '',
        vin: extractSpec('Chassis'),
        firstReg: extractSpec('1\\. gang'),
        location: '',
      },
      jsonLd,
    };

    // Extract registration number - look for "Sjekk heftelser på XXNNNNN" pattern (most reliable)
    const regNrFromHeftelser = html.match(/heftelser\s+(?:på\s+)?([A-ZÆØÅa-zæøå]{2}\s?\d{4,5})/i);
    if (regNrFromHeftelser) {
      carData.specs.regNr = regNrFromHeftelser[1].replace(/\s/g, '').toUpperCase();
    } else {
      // Fallback: extract from specs section specifically
      const regNrSpec = specsSection.match(/Registreringsnummer\s*<\/[^>]+>\s*<[^>]*>\s*([A-ZÆØÅa-zæøå]{2}\s?\d{4,5})/i);
      if (regNrSpec) {
        carData.specs.regNr = regNrSpec[1].replace(/\s/g, '').toUpperCase();
      }
    }

    // Extract location (city) from the "Sted" section near end of page
    // Text format: "Sted Address, POSTCODE City" or "Sted POSTCODE City"
    const stedSection = html.match(/Sted\s*<\/[^>]+>[\s\S]{0,500}?(\d{4})\s+([A-ZÆØÅa-zæøå][A-ZÆØÅa-zæøå\s-]+?)(?:\s*<|$)/i);
    if (stedSection) {
      carData.specs.location = stedSection[2].trim();
    } else {
      // Fallback: look in textContent near end for "Sted ... POSTCODE City"
      const textSted = textContent.match(/Sted\s+[\s\S]{0,200}?(\d{4})\s+([A-ZÆØÅa-zæøå][A-ZÆØÅa-zæøå\s-]+?)(?:\s+Annonseinformasjon|\s+FINN)/i);
      if (textSted) {
        carData.specs.location = textSted[2].trim();
      }
    }

    // Extract price - try multiple patterns (ordered by specificity)
    const pricePatterns = [
      /Totalpris[\s\S]{0,100}?([\d\s]{5,})\s*kr/i,
      /Prisantydning[\s\S]{0,100}?([\d\s]{5,})\s*kr/i,
      /Pris\s*eksl[^<]*?([\d\s]{5,})\s*kr/i,
    ];
    let priceFound = false;
    for (const pattern of pricePatterns) {
      const priceMatch = html.match(pattern);
      if (priceMatch) {
        const digits = priceMatch[1].replace(/\s/g, '').trim();
        if (digits.length >= 5) {
          (carData as any).price = digits + ' kr';
          priceFound = true;
          break;
        }
      }
    }
    if (!priceFound) {
      // Fallback: find a large number (>=5 digits after removing spaces) near "kr", 
      // but exclude "Omregistrering" context
      const allPrices = [...html.matchAll(/([\d][\d\s]{4,}[\d])\s*kr/g)];
      for (const m of allPrices) {
        const contextBefore = html.substring(Math.max(0, m.index! - 50), m.index!);
        if (/omregistrering/i.test(contextBefore)) continue;
        const digits = m[1].replace(/\s/g, '').trim();
        if (digits.length >= 5 && parseInt(digits) > 10000) {
          (carData as any).price = digits + ' kr';
          break;
        }
      }
    }

    // Extract number of owners — must be a small integer (1-10), not a year
    const ownersMatch = html.match(/Eiere?\s*<\/[^>]+>\s*<[^>]*>\s*(\d{1,2})/i) 
      || html.match(/(\d{1,2})\s*eiere?/i) 
      || textContent.match(/(\d{1,2})\s*eiere?/i);
    if (ownersMatch) {
      const val = parseInt(ownersMatch[1]);
      if (val >= 1 && val <= 10) {
        (carData as any).owners = val;
      }
    }

    // Fallback: search description text for owner patterns
    if (!(carData as any).owners) {
      const descText = (description || '') + ' ' + textContent;
      const ownerPatterns: [RegExp, number | null][] = [
        [/(\d)\s*-?\s*eiere?/i, null],
        [/(\d)\s+tidligere\s+eiere?/i, null],
        [/kun\s+hatt\s+(\d)/i, null],
        [/hatt\s+(\d)\s+eiere?/i, null],
        [/én\s+eier/i, 1],
        [/èn\s+eier/i, 1],
        [/solgt\s+ny\s+i\s+norge/i, 1],
      ];
      for (const [pat, fixed] of ownerPatterns) {
        const m = descText.match(pat);
        if (m) {
          if (fixed != null) {
            (carData as any).owners = fixed;
            break;
          }
          if (m[1]) {
            const val = parseInt(m[1]);
            if (val >= 1 && val <= 10) {
              (carData as any).owners = val;
              break;
            }
          }
        }
      }
    }

    // Extract Rekkevidde (WLTP) for electric cars
    // extractSpec only gets first text node — we need the full section including "400 km" in a separate element
    const extractWLTP = (rawText: string | null | undefined): number | null => {
      if (!rawText || typeof rawText !== 'string') return null;
      const allMatches = [...rawText.matchAll(/(\d+)\s*km/gi)];
      if (allMatches.length === 0) return null;
      const lastMatch = allMatches[allMatches.length - 1];
      return parseInt(lastMatch[1], 10);
    };
    // Grab a broad HTML section after "Rekkevidde" to capture both disclaimer and the km value
    const rekkeviddSection = html.match(/Rekkevidde[\s\S]{0,800}?(?=<\/(?:section|dl|table)|Girkasse|Kilometerstand|Batterikapasitet|Maksimal\s+tilhenger)/i)?.[0] || '';
    const rekkeviddText = rekkeviddSection.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    const wltpKm = extractWLTP(rekkeviddText);
    if (wltpKm) {
      (carData as any).rekkevidde = `${wltpKm} km`;
    } else {
      // Fallback: try textContent
      const textWltp = textContent.match(/Rekkevidde[\s\S]{0,500}/i)?.[0] || '';
      const fallbackKm = extractWLTP(textWltp);
      if (fallbackKm) {
        (carData as any).rekkevidde = `${fallbackKm} km`;
      }
    }

    // Extract Batterikapasitet from Finn structured spec
    const batteriSpec = extractSpec('Batterikapasitet');
    if (batteriSpec) {
      const bMatch = batteriSpec.match(/([\d.,]+)/);
      if (bMatch) {
        (carData as any).batteryCapacityKwh = parseFloat(bMatch[1].replace(',', '.'));
      }
    }

    // Extract equipment
    const equipMatch = html.match(/Utstyr[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
    if (equipMatch) {
      const items = [...equipMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)];
      (carData as any).equipment = items.map(m => m[1].replace(/<[^>]*>/g, '').trim()).filter(Boolean);
    }

    // Extract Garanti from structured tab section (not free text description)
    // Pattern in raw text: "Garanti\nBruktbilgaranti\nGarantiens varighet\n6 måneder\nGaranti inntil\n10 000 km"
    const garantiStructured = textContent.match(
      /(?:^|\s)Garanti\s+(Bruktbilgaranti|NAF\s+Bruktbilgaranti|Fabrikkgaranti|Nybilgaranti|Garantiforsikring)\s+(?:Garantiens\s+varighet\s+([\d]+\s*(?:måneder|mnd|år)))?\s*(?:Garanti\s+inntil\s+([\d\s]+\s*km))?/i
    );
    if (garantiStructured) {
      const type = garantiStructured[1].trim();
      const varighet = garantiStructured[2]?.trim().replace('måneder', 'mnd.') || '';
      const kmGrense = garantiStructured[3]?.trim() || '';
      const parts = [type];
      if (varighet || kmGrense) {
        parts.push([varighet, kmGrense].filter(Boolean).join(' / '));
      }
      (carData as any).garanti = parts.join(' · ');
    }

    // Extract Servicehistorikk section
    const serviceSection = html.match(/Service[\s\S]*?(?=<\/section|Garanti|Utstyr|Beskrivelse|$)/i)?.[0] || '';
    const serviceText = serviceSection.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (/serviceprogram\s+(?:er\s+)?fulgt|i\s+henhold\s+til\s+fabrikkens/i.test(serviceText)) {
      (carData as any).servicehistorikk = "Fulgt serviceprogram";
    } else if (/servicehistorikk\s+foreligger/i.test(serviceText)) {
      (carData as any).servicehistorikk = "Servicehistorikk foreligger";
    } else if (/serviceh(?:e|i)ft/i.test(serviceText) || /service\s*bok/i.test(serviceText)) {
      (carData as any).servicehistorikk = "Servicehefte følger";
    }

    // Extract seller
    const sellerMatch = html.match(/class="[^"]*"[^>]*>\s*([\w\s]+(?:AS|ENK|ANS|DA))/i);
    if (sellerMatch) {
      (carData as any).seller = sellerMatch[1].trim();
    }

    console.log('Scrape successful, title:', carData.title);

    return new Response(
      JSON.stringify({ success: true, data: carData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed to scrape' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
