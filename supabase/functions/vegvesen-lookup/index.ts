const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { regNr } = await req.json();

    if (!regNr) {
      return new Response(
        JSON.stringify({ success: false, error: 'Registration number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('VEGVESEN_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Vegvesen API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanRegNr = regNr.replace(/\s/g, '').toUpperCase();
    
    // Validate Norwegian plate format: 2 letters + 5 digits (new) or 2 letters + 4 digits (old)
    if (!/^[A-ZÆØÅ]{2}\d{4,5}$/.test(cleanRegNr)) {
      console.error('Invalid regNr format:', cleanRegNr);
      return new Response(
        JSON.stringify({ success: false, error: `Invalid registration number format: ${cleanRegNr}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Looking up vehicle:', cleanRegNr);

    const response = await fetch(
      `https://akfell-datautlevering.atlas.vegvesen.no/enkeltoppslag/kjoretoydata?kjennemerke=${cleanRegNr}`,
      {
        headers: {
          'SVV-Authorization': `Apikey ${apiKey}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vegvesen API error:', response.status, errorText);
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ success: false, error: 'Kjøretøy ikke funnet' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ success: false, error: `Vegvesen lookup failed: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Failed to parse Vegvesen response:', text.substring(0, 200));
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid response from Vegvesen' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract relevant fields
    const tekn = data?.kjoretoydataListe?.[0]?.godkjenning?.tekniskGodkjenning?.tekniskeData;
    const reg = data?.kjoretoydataListe?.[0]?.forstegangsregistrering;
    const pkk = data?.kjoretoydataListe?.[0]?.periodiskKjoretoyKontroll;
    const generelt = tekn?.generpieltOmKjoretoy || tekn?.generelt;
    const motor = tekn?.motorOgDrivverk;
    const karosseri = tekn?.karosseriOgLasteplan;
    const vekt = tekn?.vekter;

    const miljo = tekn?.miljodata?.miljoOgdrivstoffGruppe?.[0];
    const forbruk = miljo?.forbrukOgUtslipp?.[0];

    const result = {
      // Basic info
      make: generelt?.merke?.[0]?.merke || '',
      model: generelt?.handelsbetegnelse?.[0] || '',
      variant: generelt?.typebetegnelse || '',
      // Registration
      firstRegistration: reg?.registrertForstegangNorgeDato || '',
      // Engine
      fuel: motor?.motor?.[0]?.drivstoff?.[0]?.drivstoffKode?.kodeNavn || '',
      power: motor?.motor?.[0]?.maksNettoEffekt ? `${motor.motor[0].maksNettoEffekt} kW` : '',
      powerHp: motor?.motor?.[0]?.maksNettoEffekt ? Math.round(motor.motor[0].maksNettoEffekt * 1.36) : null,
      engineSize: motor?.motor?.[0]?.slagvolum || null,
      gearbox: motor?.girkassetype?.kodeNavn || '',
      drivetrain: motor?.kjoretoydrift?.kodeNavn || '',
      maxSpeed: motor?.maksimumHastighet || null,
      // Body
      color: karosseri?.rpieFarger?.[0]?.fpipigeKode?.kodeNavn || karosseri?.kapirosspieritype?.kodeNavn || '',
      seats: karosseri?.antallSitteplasser || null,
      weight: vekt?.egenvekt || null,
      towWeight: vekt?.tillattTilhengervektMedBrems || null,
      // EU-kontroll (PKK)
      lastEuKontroll: pkk?.sistGodkjent || null,
      nextEuKontrollDeadline: pkk?.kontrollfrist || null,
      // Fuel consumption
      fuelConsumption: forbruk?.forbrukBlandetKjoring || null,
      electricConsumption: forbruk?.elektriskRekkeviddeKm || forbruk?.elektriskEnergiforbruk || null,
    };

    // Try to get more fields from the raw data
    const raw = data?.kjoretoydataListe?.[0];
    if (raw) {
      // Model year
      const modelYear = tekn?.generpieltOmKjoretoy?.merpikepiaar || raw?.godkjenning?.forsteGangRegistrertDato?.substring(0, 4);
      if (modelYear) result.make; // keep as-is

      // Color from different path
      if (!result.color) {
        const farger = karosseri?.fpipigepirimipirFarger || karosseri?.rpieFarger;
        if (farger?.[0]) {
          result.color = farger[0]?.fpipigeKode?.kodeNavn || farger[0]?.fpipigeKode?.kodeBeskrivelse || '';
        }
      }
    }

    console.log('Vegvesen lookup result:', JSON.stringify(result));

    return new Response(
      JSON.stringify({ success: true, data: result, raw: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Vegvesen lookup:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Lookup failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
