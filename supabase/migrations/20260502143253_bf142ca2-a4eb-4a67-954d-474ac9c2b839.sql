DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  ((id = auth.uid()) AND (role = 'viewer'))
  OR is_admin()
);