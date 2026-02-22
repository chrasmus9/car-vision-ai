const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NHTSARecall {
  NHTSACampaignNumber: string;
  Manufacturer: string;
  Component: string;
  Summary: string;
  Consequence: string;
  Remedy: string;
  ReportReceivedDate: string;
  ModelYear: string;
  Make: string;
  Model: string;
  ParkIt: boolean;
  ParkOutSide: boolean;
  CorrectiveAction?: string;
  Notes?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { make, model, year, isElectric } = await req.json();

    if (!make || !model || !year) {
      return new Response(
        JSON.stringify({ success: false, recalls: [], nhtsaCode: 'NHTSA-003', error: 'Make, model and year required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('NHTSA lookup:', { make, model, year, isElectric });

    const fetchRecalls = async (queryModel: string): Promise<{ results: NHTSARecall[], status: number }> => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(queryModel)}&modelYear=${encodeURIComponent(year)}`;
        console.log('Fetching:', url);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!res.ok) {
          return { results: [], status: res.status };
        }
        const data = await res.json();
        return { results: data.results || [], status: res.status };
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          return { results: [], status: -1 }; // timeout
        }
        throw e;
      }
    };

    // Primary call
    const primary = await fetchRecalls(model);

    if (primary.status === -1) {
      return new Response(
        JSON.stringify({ success: false, recalls: [], nhtsaCode: 'NHTSA-005' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (primary.status !== 200 && primary.status !== 0) {
      return new Response(
        JSON.stringify({ success: false, recalls: [], nhtsaCode: `NHTSA-004:${primary.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let allRecalls = [...primary.results];
    let evMergeCount = 0;
    let nhtsaCode = '';

    // EV dual call
    if (isElectric) {
      const evModel = `${model} EV`;
      const evResult = await fetchRecalls(evModel);
      if (evResult.results.length > 0) {
        const existingIds = new Set(allRecalls.map(r => r.NHTSACampaignNumber));
        const newRecalls = evResult.results.filter(r => !existingIds.has(r.NHTSACampaignNumber));
        evMergeCount = newRecalls.length;
        allRecalls = [...allRecalls, ...newRecalls];
      }
    }

    // Deduplicate by NHTSACampaignNumber
    const seen = new Set<string>();
    const deduped: NHTSARecall[] = [];
    for (const r of allRecalls) {
      if (!seen.has(r.NHTSACampaignNumber)) {
        seen.add(r.NHTSACampaignNumber);
        deduped.push(r);
      }
    }

    // Determine code
    if (deduped.length === 0) {
      nhtsaCode = 'NHTSA-002';
    } else {
      nhtsaCode = 'NHTSA-001';
    }

    // Check for OTA
    const formatted = deduped.map(r => {
      const consequence = (r.Consequence || '').toLowerCase();
      const isHighSeverity = /fire|crash|injury|brann|ulykke/.test(consequence);
      const isOta = /over.the.air|ota|software update|remote update/i.test(
        `${r.Remedy || ''} ${r.CorrectiveAction || ''} ${r.Notes || ''}`
      );

      return {
        nhtsaCampaignNumber: r.NHTSACampaignNumber,
        title: r.Consequence || r.Component || 'Recall',
        description: r.Summary || '',
        remedy: r.Remedy || '',
        date: r.ReportReceivedDate ? r.ReportReceivedDate.substring(r.ReportReceivedDate.lastIndexOf('/') + 1) : '',
        severity: isHighSeverity ? 'high' as const : 'medium' as const,
        component: r.Component || '',
        manufacturer: r.Manufacturer || '',
        overTheAirUpdate: isOta,
        source: 'nhtsa' as const,
      };
    });

    const codesSuffix = evMergeCount > 0 ? ` | NHTSA-006:${evMergeCount}` : '';

    return new Response(
      JSON.stringify({
        success: true,
        recalls: formatted,
        nhtsaCode: nhtsaCode + codesSuffix,
        count: formatted.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('NHTSA error:', error);
    return new Response(
      JSON.stringify({ success: false, recalls: [], nhtsaCode: 'NHTSA-004', error: error instanceof Error ? error.message : 'Failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
