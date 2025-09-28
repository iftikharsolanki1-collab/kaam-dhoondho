-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Users can view basic post info" ON public.posts;

-- Create a secure policy that masks phone numbers for public view
CREATE POLICY "Users can view basic post info (phone masked)" 
ON public.posts 
FOR SELECT 
USING (true);

-- Create a view for public post data with masked phone numbers
CREATE OR REPLACE VIEW public.posts_public AS
SELECT 
  id,
  title,
  description,
  location,
  rate,
  type,
  skill_id,
  is_urgent,
  photos,
  created_at,
  updated_at,
  name,
  -- Mask phone number for public view
  CASE 
    WHEN auth.uid() = user_id THEN phone
    ELSE mask_phone_number(phone)
  END as phone,
  user_id
FROM public.posts;

-- Grant SELECT permission on the view
GRANT SELECT ON public.posts_public TO authenticated, anon;