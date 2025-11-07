import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting cleanup of cancelled appointments from previous month');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate first and last day of previous month
    const now = new Date();
    const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const firstDayStr = firstDayPrevMonth.toISOString().split('T')[0];
    const lastDayStr = lastDayPrevMonth.toISOString().split('T')[0];

    console.log(`Deleting cancelled appointments from ${firstDayStr} to ${lastDayStr}`);

    // Delete cancelled appointments from previous month
    const { data, error } = await supabase
      .from('appointments')
      .delete()
      .eq('status', 'cancelled')
      .gte('appointment_date', firstDayStr)
      .lte('appointment_date', lastDayStr)
      .select();

    if (error) {
      console.error('Error deleting appointments:', error);
      throw error;
    }

    const deletedCount = data?.length || 0;
    console.log(`Successfully deleted ${deletedCount} cancelled appointments`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedCount,
        period: `${firstDayStr} to ${lastDayStr}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in cleanup-cancelled-appointments function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
