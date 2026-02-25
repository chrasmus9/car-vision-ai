const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const regNr = typeof body?.regNr === 'string' ? body.regNr : '';

    if (!regNr) {
      return new Response(
        JSON.stringify({ success: false, error: 'Registration number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanRegNr = regNr.replace(/\s/g, '').toUpperCase();

    // Validate Norwegian plate format
    if (!/^[A-ZÆØÅ]{2}\d{4,5}$/.test(cleanRegNr)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid registration number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Looking up heftelser for:', cleanRegNr);

    const response = await fetch(
      `https://losoreregisteret.brreg.no/registerinfo/api/v2/rettsstiftelse/regnr/${cleanRegNr}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BruktbilSjekkApp/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error('Brønnøysund API error:', response.status);
      return new Response(
        JSON.stringify({ success: false, error: `API request failed: ${response.status}`, unavailable: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    const count = data.antallRettsstiftelser ?? 0;
    const items = (data.rettsstiftelser || []).map((r: any) => ({
      type: r.typeBeskrivelse || r.type || 'Ukjent',
      date: r.innkomsttidspunkt || r.dato || '',
    }));

    console.log('Heftelser result:', count, 'items');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          count,
          items,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in heftelser lookup:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Lookup failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
