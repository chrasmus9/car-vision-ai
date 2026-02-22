const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function scrapeRegNr(finnUrl: string): Promise<string | null> {
  try {
    const response = await fetch(finnUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });
    if (!response.ok) return null;
    const html = await response.text();

    // Look for "Sjekk heftelser på XXNNNNN" pattern
    const match = html.match(/heftelser\s+(?:på\s+)?([A-ZÆØÅa-zæøå]{2}\s?\d{4,5})/i);
    if (match) return match[1].replace(/\s/g, '').toUpperCase();

    // Fallback: specs section
    const specMatch = html.match(/Registreringsnummer\s*<\/[^>]+>\s*<[^>]*>\s*([A-ZÆØÅa-zæøå]{2}\s?\d{4,5})/i);
    if (specMatch) return specMatch[1].replace(/\s/g, '').toUpperCase();

    return null;
  } catch {
    return null;
  }
}

function deriveDrivetrain(raw: any): string {
  try {
    const tekn = raw?.kjoretoydataListe?.[0]?.godkjenning?.tekniskGodkjenning?.tekniskeData;
    
    // Correct Vegvesen path: tekn.akslinger.akselGruppe[].akselListe.aksel[].drivAksel
    const akselGrupper = tekn?.akslinger?.akselGruppe || [];
    if (Array.isArray(akselGrupper) && akselGrupper.length > 0) {
      let drivAxleGroupCount = 0;
      for (const gruppe of akselGrupper) {
        const aksler = gruppe?.akselListe?.aksel || [];
        for (const aksel of aksler) {
          if (aksel?.drivAksel === true) {
            drivAxleGroupCount++;
            break; // one drive axle per group is enough
          }
        }
      }
      if (drivAxleGroupCount >= 2) return 'Firehjulsdrift';
      if (drivAxleGroupCount === 1) return 'Tohjulsdrift';
    }

    // Try motor/drivetrain field
    const motor = tekn?.motorOgDrivverk;
    const driveCode = motor?.kjoretoydrift?.kodeNavn || '';
    if (/fire|4|all/i.test(driveCode)) return 'Firehjulsdrift';
    if (/to|2|bakhjul|forhjul|rear|front/i.test(driveCode)) return 'Tohjulsdrift';

    // Fallback: check handelsbetegnelse for AWD/4WD/xDrive etc
    const generelt = tekn?.generelt;
    const betegnelse = generelt?.handelsbetegnelse?.[0] || '';
    if (/xdrive|awd|4wd|quattro|4motion|4matic|allgrip|symmetrical/i.test(betegnelse)) {
      return 'Firehjulsdrift';
    }

    return '';
  } catch {
    return '';
  }
}

async function lookupVegvesen(regNr: string, apiKey: string): Promise<{ variant: string; drivetrain: string } | null> {
  try {
    const response = await fetch(
      `https://akfell-datautlevering.atlas.vegvesen.no/enkeltoppslag/kjoretoydata?kjennemerke=${regNr}`,
      {
        headers: {
          'SVV-Authorization': `Apikey ${apiKey}`,
          'Accept': 'application/json',
        },
      }
    );
    if (!response.ok) return null;

    const raw = await response.json();
    const tekn = raw?.kjoretoydataListe?.[0]?.godkjenning?.tekniskGodkjenning?.tekniskeData;
    const generelt = tekn?.generelt;

    const variant = generelt?.handelsbetegnelse?.[0] || '';
    const drivetrain = deriveDrivetrain(raw);

    return { variant, drivetrain };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listings } = await req.json();

    if (!Array.isArray(listings) || listings.length === 0) {
      return new Response(
        JSON.stringify({ success: true, data: {} }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('VEGVESEN_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Vegvesen API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process max 10 listings in parallel
    const toProcess = listings.slice(0, 10);
    const results: Record<string, { variant: string; drivetrain: string }> = {};

    await Promise.all(
      toProcess.map(async (listing: { finnCode: string; url: string }) => {
        const regNr = await scrapeRegNr(listing.url);
        if (!regNr || !/^[A-ZÆØÅ]{2}\d{4,5}$/.test(regNr)) return;

        const data = await lookupVegvesen(regNr, apiKey);
        if (data) {
          results[listing.finnCode] = data;
        }
      })
    );

    console.log(`Enriched ${Object.keys(results).length}/${toProcess.length} listings`);

    return new Response(
      JSON.stringify({ success: true, data: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error enriching listings:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Enrichment failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
