-- Make the media bucket public so uploaded images can be displayed
UPDATE storage.buckets SET public = true WHERE id = 'media';

-- Allow anyone to read files from the media bucket
CREATE POLICY "Public read access to media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Allow authenticated admins to upload to media bucket
CREATE POLICY "Admins can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media' AND (SELECT public.is_admin()));

-- Allow authenticated admins to update media
CREATE POLICY "Admins can update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND (SELECT public.is_admin()));

-- Allow authenticated admins to delete media
CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND (SELECT public.is_admin()));
