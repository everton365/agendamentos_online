-- Create RLS policies for the clientes storage bucket
CREATE POLICY "Users can upload to clientes bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'clientes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view files in clientes bucket" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'clientes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their files in clientes bucket" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'clientes' AND auth.uid()::text = (storage.foldername(name))[1]);