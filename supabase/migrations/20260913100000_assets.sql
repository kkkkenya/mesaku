-- Assets: an admin-only media library (logos, photos, PDFs like the
-- constitution and handbook) for reuse in newsletters and event posters.
-- Files themselves live in the existing public "media" storage bucket,
-- under the "assets/" folder — its policies already allow admin uploads.
-- Idempotent: safe to run more than once.

CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('logo','document','photo','other')),
  file_url text NOT NULL,
  mime text NOT NULL DEFAULT '',
  size_bytes bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_manage_assets" ON public.assets;
CREATE POLICY "admins_manage_assets"
ON public.assets
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
