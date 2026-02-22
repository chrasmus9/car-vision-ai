const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { regNr, vin } = await req.json();

    if (!regNr && !vin) {
      return new Response(
        JSON.stringify({ success: false, error: 'VIN or registration number is required', svvCode: 'SVV-004' }),
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

    let svvCode = '';
    let lookupMethod = '';
    let response: Response | null = null;

    // Try VIN first (must be exactly 17 alphanumeric chars)
    const cleanVin = vin ? vin.replace(/\s/g, '').toUpperCase() : '';
    const isValidVin = /^[A-HJ-NPR-Z0-9]{17}$/i.test(cleanVin);

    if (vin && isValidVin) {
      console.log('Trying VIN lookup:', cleanVin);
      lookupMethod = 'vin';

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        response = await fetch(
          `https://akfell-datautlevering.atlas.vegvesen.no/enkeltoppslag/kjoretoydata?understellsnummer=${cleanVin}`,
          {
            headers: {
              'SVV-Authorization': `Apikey ${apiKey}`,
              'Accept': 'application/json',
            },
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          if (!regNr) {
            return new Response(
              JSON.stringify({ success: false, error: 'Vegvesen API timed out', svvCode: 'SVV-006' }),
              { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          console.warn('VIN lookup timed out, falling back to regNr');
          response = null;
        } else {
          throw e;
        }
      }

      if (response && !response.ok) {
        console.warn('VIN lookup failed with status:', response.status, '- falling back to regNr');
        response = null;
      }
    }

    // Fall back to registration number
    if (!response && regNr) {
      const cleanRegNr = regNr.replace(/\s/g, '').toUpperCase();
      
      if (!/^[A-ZÆØÅ]{2}\d{4,5}$/.test(cleanRegNr)) {
        console.error('Invalid regNr format:', cleanRegNr);
        return new Response(
          JSON.stringify({ success: false, error: `Invalid registration number format: ${cleanRegNr}`, svvCode: 'SVV-004' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Looking up by regNr:', cleanRegNr);
      lookupMethod = 'regNr';

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        response = await fetch(
          `https://akfell-datautlevering.atlas.vegvesen.no/enkeltoppslag/kjoretoydata?kjennemerke=${cleanRegNr}`,
          {
            headers: {
              'SVV-Authorization': `Apikey ${apiKey}`,
              'Accept': 'application/json',
            },
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          return new Response(
            JSON.stringify({ success: false, error: 'Vegvesen API timed out', svvCode: 'SVV-006' }),
            { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw e;
      }
    }

    if (!response) {
      return new Response(
        JSON.stringify({ success: false, error: 'No valid identifier for lookup', svvCode: 'SVV-004' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vegvesen API error:', response.status, errorText);
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ success: false, error: 'Kjøretøy ikke funnet', svvCode: `SVV-005:${response.status}` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ success: false, error: `Vegvesen lookup failed: ${response.status}`, svvCode: `SVV-005:${response.status}` }),
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
        JSON.stringify({ success: false, error: 'Invalid response from Vegvesen', svvCode: 'SVV-003' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine SVV code
    const hasData = data?.kjoretoydataListe?.length > 0;
    if (!hasData) {
      svvCode = 'SVV-003';
    } else if (lookupMethod === 'vin') {
      svvCode = 'SVV-001';
    } else {
      svvCode = vin ? 'SVV-002' : 'SVV-001'; // SVV-002 means VIN was tried but failed, fell back
    }

    if (!hasData) {
      return new Response(
        JSON.stringify({ success: false, error: 'No vehicle data returned', svvCode }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract relevant fields
    const godkjenning = data?.kjoretoydataListe?.[0]?.godkjenning;
    const tekn = godkjenning?.tekniskGodkjenning?.tekniskeData;
    const reg = data?.kjoretoydataListe?.[0]?.forstegangsregistrering;
    const pkk = data?.kjoretoydataListe?.[0]?.periodiskKjoretoyKontroll;
    const generelt = tekn?.generpieltOmKjoretoy || tekn?.generelt;
    const motor = tekn?.motorOgDrivverk;
    const karosseri = tekn?.karosseriOgLasteplan;
    const vekt = tekn?.vekter;

    const miljo = tekn?.miljodata?.miljoOgdrivstoffGruppe?.[0];
    const forbruk = miljo?.forbrukOgUtslipp?.[0];

    // Extract battery capacity from elMotor data
    const elMotorer = motor?.elMotor || [];
    let batteryCapacityKwh: number | null = null;
    for (const em of (Array.isArray(elMotorer) ? elMotorer : [elMotorer])) {
      if (em?.batteristorrelse) {
        batteryCapacityKwh = em.batteristorrelse;
        break;
      }
      if (em?.batterikapasitet) {
        batteryCapacityKwh = em.batterikapasitet;
        break;
      }
    }

    // Extract first approval date (anywhere in world) and first Norway registration
    const forstegangsGodkjenningDato = godkjenning?.forstegangsGodkjenning?.forstegangsGodkjenningDato || null;
    const registrertForstegangNorgeDato = reg?.registrertForstegangNorgeDato || null;

    // Log full response for debugging bruktimportert paths
    const raw0 = data?.kjoretoydataListe?.[0];
    console.log('Vegvesen raw0 keys:', raw0 ? Object.keys(raw0) : 'N/A');
    console.log('godkjenning keys:', godkjenning ? Object.keys(godkjenning) : 'N/A');
    console.log('godkjenning.kjoretoymerknad:', JSON.stringify(godkjenning?.kjoretoymerknad));
    console.log('raw0.registrering:', JSON.stringify(raw0?.registrering));

    // Check all 6 possible paths for bruktimportert, priority order
    const bruktimportertPaths = [
      godkjenning?.kjoretoymerknad?.bruktimportert,
      // kjoretoymerknad may be an array of merknad objects
      ...(Array.isArray(godkjenning?.kjoretoymerknad)
        ? godkjenning.kjoretoymerknad.map((m: any) => m?.bruktimportert)
        : []),
      raw0?.registrering?.bruktimportert,
      godkjenning?.registrering?.bruktimportert,
      raw0?.bruktimportert,
      data?.bruktimportert,
    ];
    console.log('bruktimportert candidates:', JSON.stringify(bruktimportertPaths));
    const bruktimportert = bruktimportertPaths.find((v) => v !== null && v !== undefined) ?? null;
    console.log('bruktimportert resolved:', bruktimportert);

    const result = {
      make: generelt?.merke?.[0]?.merke || '',
      model: generelt?.handelsbetegnelse?.[0] || '',
      variant: generelt?.typebetegnelse || '',
      firstRegistration: registrertForstegangNorgeDato || '',
      forstegangsGodkjenningDato,
      registrertForstegangNorgeDato,
      fuel: motor?.motor?.[0]?.drivstoff?.[0]?.drivstoffKode?.kodeNavn || '',
      power: motor?.motor?.[0]?.maksNettoEffekt ? `${motor.motor[0].maksNettoEffekt} kW` : '',
      powerHp: motor?.motor?.[0]?.maksNettoEffekt ? Math.round(motor.motor[0].maksNettoEffekt * 1.36) : null,
      engineSize: motor?.motor?.[0]?.slagvolum || null,
      gearbox: motor?.girkassetype?.kodeNavn || '',
      drivetrain: motor?.kjoretoydrift?.kodeNavn || '',
      maxSpeed: Array.isArray(motor?.maksimumHastighet) ? motor.maksimumHastighet[0] : (motor?.maksimumHastighet || null),
      color: karosseri?.rpieFarger?.[0]?.fpipigeKode?.kodeNavn || karosseri?.kapirosspieritype?.kodeNavn || '',
      seats: karosseri?.antallSitteplasser || null,
      weight: vekt?.egenvekt || null,
      towWeight: vekt?.tillattTilhengervektMedBrems || null,
      lastEuKontroll: pkk?.sistGodkjent || null,
      nextEuKontrollDeadline: pkk?.kontrollfrist || null,
      fuelConsumption: forbruk?.forbrukBlandetKjoring || null,
      electricConsumption: forbruk?.elektriskEnergiforbruk || forbruk?.elektriskRekkeviddeKm || null,
      batteryCapacityKwh,
      bruktimportert,
      svvCode,
    };

    const raw = data?.kjoretoydataListe?.[0];
    if (raw) {
      if (!result.color) {
        const farger = karosseri?.fpipigepirimipirFarger || karosseri?.rpieFarger;
        if (farger?.[0]) {
          result.color = farger[0]?.fpipigeKode?.kodeNavn || farger[0]?.fpipigeKode?.kodeBeskrivelse || '';
        }
      }
    }

    console.log('Vegvesen lookup result:', JSON.stringify({ svvCode, lookupMethod }));

    return new Response(
      JSON.stringify({ success: true, data: result, raw: data, svvCode }),
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
