-- Remove the overly permissive policy that exposes all profile data
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;