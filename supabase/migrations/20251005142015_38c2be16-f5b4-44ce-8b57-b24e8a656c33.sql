-- Fix security issue: Restrict profiles table access to protect user emails and phone numbers
-- Drop the overly permissive policy that allows anyone to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a new policy that only allows users to view their own profile
-- This prevents harvesting of email addresses and phone numbers
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Note: If your application needs to display user names/photos from other users,
-- consider creating a separate public_profiles view with only non-sensitive fields,
-- or fetch this data through the posts table which already contains name and photo fields.