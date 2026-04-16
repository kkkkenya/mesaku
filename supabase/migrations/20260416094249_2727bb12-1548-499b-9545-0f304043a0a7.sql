
-- Drop existing broad policies that allow listing
DROP POLICY IF EXISTS "Public read access to media files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to media" ON storage.objects;

-- Allow authenticated users to read files (not anon listing)
CREATE POLICY "Authenticated read media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'media');
