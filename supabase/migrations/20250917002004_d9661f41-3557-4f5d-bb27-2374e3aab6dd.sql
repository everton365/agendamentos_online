-- Create cron job to send WhatsApp reminders daily at 7 PM (Brasília time)
-- First ensure pg_cron extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the WhatsApp reminder function to run daily at 19:00 Brasília time (22:00 UTC)
SELECT cron.schedule(
  'whatsapp-daily-reminders',
  '0 22 * * *', -- 22:00 UTC = 19:00 Brasília time
  $$
  SELECT
    net.http_post(
        url := 'https://tndmjofklolancbhchbl.supabase.co/functions/v1/whatsapp-reminder',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZG1qb2ZrbG9sYW5jYmhjaGJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTcyMTU2MCwiZXhwIjoyMDcxMjk3NTYwfQ.G2RQkqaTrwSs2knFzz8dzx5FzKeZj3R75X8vpS9xKxI'
        ),
        body := '{}'::jsonb
    ) as request_id;
  $$
);