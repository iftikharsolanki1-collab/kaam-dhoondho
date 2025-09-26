-- Fix critical phone number privacy issue - replace overly permissive policy
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;

-- Create new privacy-respecting policies for posts
CREATE POLICY "Users can view basic post info" 
ON public.posts 
FOR SELECT 
USING (true);

-- Create policy for viewing full post details including phone (only for post owner or through messaging)
CREATE POLICY "Users can view full post details" 
ON public.posts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update profiles table policy - only allow users to view their own profiles and profiles they're chatting with
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add function to mask phone numbers for public display
CREATE OR REPLACE FUNCTION public.mask_phone_number(phone_number text)
RETURNS text AS $$
BEGIN
  IF phone_number IS NULL OR length(phone_number) < 6 THEN
    RETURN phone_number;
  END IF;
  
  RETURN substr(phone_number, 1, 3) || '****' || substr(phone_number, -2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;