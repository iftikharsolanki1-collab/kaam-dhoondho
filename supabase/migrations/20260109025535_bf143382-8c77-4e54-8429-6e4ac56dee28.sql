-- Allow authenticated users to view basic profile info (name, avatar) for chat
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);