-- Allow users to create their own profile
CREATE POLICY "users_insert_own_profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
