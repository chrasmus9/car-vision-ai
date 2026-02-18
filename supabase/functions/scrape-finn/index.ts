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

    // Extract images
    const imageMatches = [...html.matchAll(/images\.finncdn\.no\/dynamic\/[^"'\s]*/g)];
    const images = [...new Set(imageMatches.map(m => `https://${m[0]}`))].slice(0, 5);

    // Extract specs from the page
    const specsSection = html.match(/Spesifikasjoner[\s\S]*?(?=Utstyr|Beskrivelse|$)/i)?.[0] || '';
    
    const extractSpec = (label: string) => {
      const pattern = new RegExp(label + '[\\s\\S]*?<[^>]*>([^<]+)', 'i');
      const match = specsSection.match(pattern) || html.match(pattern);
      return match ? match[1].trim() : '';
    };

    const carData = {
      title: title.replace(/<[^>]*>/g, '').trim(),
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
        regNr: extractSpec('Registreringsnummer'),
        vin: extractSpec('Chassis'),
        firstReg: extractSpec('1\\. gang'),
        location: extractSpec('Bilen står i'),
      },
      jsonLd,
    };

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

    // Extract equipment
    const equipMatch = html.match(/Utstyr[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
    if (equipMatch) {
      const items = [...equipMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)];
      (carData as any).equipment = items.map(m => m[1].replace(/<[^>]*>/g, '').trim()).filter(Boolean);
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
