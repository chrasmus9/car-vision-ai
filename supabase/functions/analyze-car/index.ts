const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { carData, vegvesenData } = await req.json();

    if (!carData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Car data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const vegvesenSection = vegvesenData ? `

Offisielle data fra Statens vegvesen (Vegvesen API):
${JSON.stringify(vegvesenData, null, 2)}

VIKTIG: Sammenlign Finn-annonsen med de offisielle Vegvesen-dataene. Hvis du finner avvik (f.eks. ulik modellår, hestekrefter, drivstofftype, førstegangsregistrering, motorstørrelse), SKAL du inkludere disse som risikoer med level "high" og category "Avvik".
` : '';

    const prompt = `Du er en ekspert bilanalytiker. Analyser følgende bilannonse fra Finn.no og gi en grundig analyse på norsk.

Bildata fra Finn.no-annonsen:
${JSON.stringify(carData, null, 2)}
${vegvesenSection}
Gi svaret som JSON med følgende struktur:
{
  "summary": "En kort oppsummering (3-5 setninger) av bilen med de viktigste funnene",
  "risks": [
    {
      "level": "high|medium|low",
      "title": "Kort tittel på risikoen",
      "category": "Kategori (f.eks. Motor, Drivverk, Karosseri, Elektronikk, Økonomi, Vedlikehold, Sikkerhet, Avvik)",
      "description": "Grundig forklaring av risikoen og hva det betyr for kjøper",
      "question": "Et konkret spørsmål kjøper bør stille selger om denne risikoen"
    }
  ],
  "highlights": [
    "Positive ting ved bilen som korte setninger"
  ],
  "priceAssessment": "En vurdering av prisen sammenlignet med markedet",
  "overallRisk": "low|medium|high",
  "recalls": [
    {
      "title": "Kort tittel på tilbakekallingen",
      "status": "active|expired|completed",
      "date": "Omtrentlig dato eller årstall",
      "description": "Hva tilbakekallingen gjelder og hva som ble/må utbedres",
      "severity": "high|medium|low",
      "advice": "Konkret råd til kjøper om hva de bør gjøre"
    }
  ]
}

Inkluder 4-6 risikoer (minst 1 høy, 1 middels, 1 lav) med kategori og spørsmål for hver.
${vegvesenData ? 'Inkluder ALLE avvik mellom Finn-data og Vegvesen-data som separate risikoer med category "Avvik".' : ''}
Inkluder 3-5 positive høydepunkter.
Inkluder ALLE kjente tilbakekallinger (recalls) for denne SPESIFIKKE bilmodellen, årsmodellen OG varianten (f.eks. EV, PHEV, hybrid, diesel, bensin). Ikke bland tilbakekallinger fra andre varianter. Hvis bilen er en elbil, inkluder KUN tilbakekallinger som gjelder elbil-varianten. Inkluder både aktive og utløpte/fullførte tilbakekallinger. Det er INGEN grense på antall — returner alle du kjenner til. Hvis du ikke kjenner til noen, returner en tom liste.
Svar KUN med JSON, ingen annen tekst.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: `AI request failed: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '';

    // Parse JSON from the response (handle markdown code blocks)
    let analysis;
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse AI analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI analysis complete');

    return new Response(
      JSON.stringify({ success: true, data: analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
