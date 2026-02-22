import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Appointment {
  id: string;
  name: string;
  phone: string;
  service: string;
  message: string;
  appointment_date: string;
  appointment_time: string;
  duration: string;
  price: string;
}

interface WhatsAppResult {
  appointment_id: string;
  status: number;
  success: boolean;
  error?: string;
}

function formatWhatsAppMessage(appointment: Appointment): string {
  const { name, appointment_date, appointment_time, service, duration, price, message } = appointment;
  
  // Format date to DD/MM/YYYY
  const [year, month, day] = appointment_date.split('-');
  const formattedDate = `${day}/${month}/${year}`;
  
  // Format time to HH:MM
  const formattedTime = appointment_time;
  
  let whatsappMessage = `🗓️ *Lembrete de Agendamento*\n\n`;
  whatsappMessage += `👋 Olá *${name}*!\n\n`;
  whatsappMessage += `Lembramos que você tem um agendamento marcado para:\n\n`;
  whatsappMessage += `📅 *Data:* ${formattedDate}\n`;
  whatsappMessage += `🕐 *Horário:* ${formattedTime}\n`;
  whatsappMessage += `💆‍♀️ *Serviço:* ${service}\n`;
  whatsappMessage += `⏱️ *Duração:* ${duration} minutos\n`;
  whatsappMessage += `💰 *Valor:* R$ ${price}\n`;
  
  if (message && message.trim()) {
    whatsappMessage += `📝 *Observação:* ${message}\n`;
  }
  
  whatsappMessage += `\nAguardamos você! ✨\n\n`;
  whatsappMessage += `Em caso de necessidade de remarcação, entre em contato conosco.`;
  
  return whatsappMessage;
}

async function sendWhatsAppMessage(phone: string, message: string): Promise<{ status: number; success: boolean; error?: string }> {
  const whatsappAccessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  
  if (!whatsappAccessToken || !whatsappPhoneNumberId) {
    throw new Error('WhatsApp credentials not configured');
  }

  const url = `https://graph.facebook.com/v18.0/${whatsappPhoneNumberId}/messages`;
  
  const payload = {
    messaging_product: "whatsapp",
    to: phone,
    type: "text",
    text: {
      body: message,
      preview_url: false
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('WhatsApp API Error:', responseData);
      return {
        status: response.status,
        success: false,
        error: responseData.error?.message || 'WhatsApp API Error'
      };
    }

    console.log('WhatsApp message sent successfully:', responseData);
    return {
      status: response.status,
      success: true
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      status: 500,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Convert to Brasília timezone (UTC-3)
  const brasiliaTime = new Date(tomorrow.getTime() - (3 * 60 * 60 * 1000));
  
  return brasiliaTime.toISOString().split('T')[0];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting WhatsApp reminder function...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get tomorrow's date
    const tomorrowDate = getTomorrowDate();
    console.log('Looking for appointments on:', tomorrowDate);

    // Fetch confirmed appointments for tomorrow
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('id, name, phone, service, message, appointment_date, appointment_time, duration, price')
      .eq('status', 'confirmed')
      .eq('appointment_date', tomorrowDate);

    if (error) {
      console.error('Error fetching appointments:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Found ${appointments?.length || 0} confirmed appointments for tomorrow`);

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No confirmed appointments found for tomorrow',
          results: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Send WhatsApp messages to each appointment
    const results: WhatsAppResult[] = [];

    for (const appointment of appointments) {
      console.log(`Sending reminder to ${appointment.name} (${appointment.phone})`);
      
      const message = formatWhatsAppMessage(appointment as Appointment);
      const whatsappResult = await sendWhatsAppMessage(appointment.phone, message);
      
      results.push({
        appointment_id: appointment.id,
        status: whatsappResult.status,
        success: whatsappResult.success,
        error: whatsappResult.error
      });
    }

    // Count successful and failed sends
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`WhatsApp reminders sent: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${appointments.length} appointments: ${successful} sent, ${failed} failed`,
        results: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in whatsapp-reminder function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        results: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});