CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  tag text NOT NULL DEFAULT 'Announcement' CHECK (tag IN ('Announcement','Event','News','Update')),
  date date NOT NULL,
  published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published announcements"
ON public.announcements
FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "admins_manage_announcements"
ON public.announcements
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());