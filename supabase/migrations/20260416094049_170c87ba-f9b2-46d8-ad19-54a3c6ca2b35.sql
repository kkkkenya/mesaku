
-- Drop the existing permissive update policy
DROP POLICY "profiles_update_own" ON public.profiles;

-- Recreate: users can update their own row BUT cannot change their role (unless they are already admin)
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid() OR is_admin())
WITH CHECK (
  (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
  OR is_admin()
);
