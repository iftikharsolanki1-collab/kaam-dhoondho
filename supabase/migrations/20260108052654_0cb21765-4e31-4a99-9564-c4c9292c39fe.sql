-- Drop the overly permissive policy on profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a more restrictive policy - users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Note: Posts remain publicly viewable for job marketplace functionality
-- but phone numbers should ideally be accessed through post_contacts table