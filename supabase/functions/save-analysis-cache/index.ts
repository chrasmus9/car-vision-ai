import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { finn_code, finn_url, car_data, analysis_data, vegvesen_data, similar_listings, price_stats, user_id } = body;

    // Validate required fields
    if (!finn_code || !/^\d{9,}$/.test(String(finn_code))) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or missing finn_code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!car_data || typeof car_data !== 'object') {
      return new Response(
        JSON.stringify({ success: false, error: 'car_data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!analysis_data || typeof analysis_data !== 'object') {
      return new Response(
        JSON.stringify({ success: false, error: 'analysis_data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (finn_url && !String(finn_url).includes('finn.no')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid finn_url' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate user_id if provided (must be a UUID)
    if (user_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(user_id))) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid user_id format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { error } = await supabaseAdmin.from('analysis_cache').upsert({
      finn_code,
      finn_url: finn_url || null,
      car_data,
      analysis_data,
      vegvesen_data: vegvesen_data || null,
      similar_listings: similar_listings || null,
      price_stats: price_stats || null,
      user_id: user_id || null,
    }, { onConflict: 'finn_code' });

    if (error) {
      console.error('Cache upsert error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save cache' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Save cache error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
