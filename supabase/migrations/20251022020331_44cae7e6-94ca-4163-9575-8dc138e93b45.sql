-- Remove the unique constraint on user_id to allow multiple profiles per user
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;

-- Add a composite unique constraint on user_id and studio_id
-- This ensures one profile per user per studio
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_studio_id_key UNIQUE (user_id, studio_id);