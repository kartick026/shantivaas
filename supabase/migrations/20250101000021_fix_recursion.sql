-- Fix infinite recursion in user_profiles RLS by using a SECURITY DEFINER function

-- 1. Create a secure function to check admin status
-- SECURITY DEFINER ensures this runs with owner privileges, bypassing RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the problematic recursive policy
DROP POLICY IF EXISTS "admin_all_access_user_profiles" ON public.user_profiles;

-- 3. Re-create the policy using the secure function
CREATE POLICY "admin_all_access_user_profiles"
  ON public.user_profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin());
