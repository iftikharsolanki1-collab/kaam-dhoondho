-- Remove the overly permissive profile policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create a function to check if user has contacted/messaged another user
CREATE OR REPLACE FUNCTION public.has_contact_with_user(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM messages 
    WHERE (sender_id = auth.uid() AND receiver_id = target_user_id)
    OR (receiver_id = auth.uid() AND sender_id = target_user_id)
  )
$$;

-- Create a secure function to get post phone number (only if owner or has contacted)
CREATE OR REPLACE FUNCTION public.get_post_phone(post_user_id uuid, post_phone text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN auth.uid() = post_user_id THEN post_phone
    WHEN public.has_contact_with_user(post_user_id) THEN post_phone
    ELSE NULL
  END
$$;

-- Create a secure view for posts that hides phone numbers until contact is made
CREATE OR REPLACE VIEW public.posts_secure AS
SELECT 
  id,
  created_at,
  updated_at,
  title,
  description,
  location,
  rate,
  type,
  user_id,
  name,
  is_urgent,
  is_verified,
  category_id,
  skill_id,
  photos,
  video_url,
  experience,
  -- Phone is only visible if: user owns the post OR has messaged the post owner
  public.get_post_phone(user_id, phone) AS phone
FROM public.posts;

-- Grant access to the view
GRANT SELECT ON public.posts_secure TO authenticated;
GRANT SELECT ON public.posts_secure TO anon;