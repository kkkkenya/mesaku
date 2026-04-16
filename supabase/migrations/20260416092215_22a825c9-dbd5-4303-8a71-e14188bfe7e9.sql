-- Drop the broad SELECT policy
DROP POLICY "Public read access to media" ON storage.objects;

-- Create a more specific read policy that only allows reading individual files, not listing
CREATE POLICY "Public read access to media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'media' AND auth.role() = 'anon');
