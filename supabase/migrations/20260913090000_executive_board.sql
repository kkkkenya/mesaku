-- Executive Board: DB-driven members manageable from the admin panel.
-- Rows are ordered by order_index (ascending) on the public site.
-- Archived members are hidden from the public site but kept in the archive tab.
-- Idempotent: safe to run more than once.

CREATE TABLE IF NOT EXISTS public.executives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  image_url text,
  order_index integer NOT NULL DEFAULT 0,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.executives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active executives" ON public.executives;
CREATE POLICY "Public can read active executives"
ON public.executives
FOR SELECT
TO anon, authenticated
USING (archived = false);

DROP POLICY IF EXISTS "admins_manage_executives" ON public.executives;
CREATE POLICY "admins_manage_executives"
ON public.executives
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Seed the current board (order matches the existing homepage layout).
-- image_url is null: the site falls back to the bundled photos until
-- each member's photo is re-uploaded through the admin panel.
INSERT INTO public.executives (id, name, role, order_index) VALUES
  ('2d506c16-4bf5-4e43-a2c3-e75f66e0cd85', 'Isaac Omondi Ogweno',    'Chairman, MESA',           1),
  ('caf9340b-3160-4bf8-a215-445c93c45538', 'Gregory Muhoro',          'Deputy Chair',             2),
  ('31eebb2f-623e-4d68-8fb8-adb58bea106c', 'Wiseman Kaberia',         'Deputy Secretary General', 3),
  ('92519cdd-17a4-4467-8868-3873726828be', 'Lyneford Muriithi',       'Treasurer',                4),
  ('4d91ca50-db83-4ae1-b2b8-2db736a74e8b', 'Godwin Fadhili Imbala',   'Publicity Secretary',      5),
  ('11892945-9035-47e2-b8ea-6769b88f6056', 'Lewis Kimani',            'Industrial Lead',          6),
  ('0a340510-6896-4e5e-b265-6e34055074dc', 'Stephen Kamau G',         'Organizing Secretary',     7),
  ('c5a6fe83-fc20-408a-8f82-e2d963e0b10f', 'Teddy Odhiambo Onyango',  '1st Year Representative',  8),
  ('1f493c33-bb48-4970-a92b-fd3c62e3f55b', 'Gloria',                  '4th Year Representative',  9),
  ('386c7a8a-66ce-4724-9586-8aa795c39d3d', 'Kituyi Noelyn Nasimiyu',  'Assistant Publicity Lead', 10)
ON CONFLICT (id) DO NOTHING;
