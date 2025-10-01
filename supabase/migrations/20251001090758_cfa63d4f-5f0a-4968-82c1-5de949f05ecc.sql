-- Fix phone number exposure security issue

-- Step 1: Drop the overly permissive policy that allows public access to posts table
DROP POLICY IF EXISTS "Users can view basic post info (phone masked)" ON public.posts;

-- Step 2: Ensure posts table only allows access to post owners or authenticated users viewing their own posts
CREATE POLICY "Users can view their own posts with full details" 
ON public.posts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Step 3: Update the posts_public view to be more secure and ensure proper masking
DROP VIEW IF EXISTS public.posts_public;

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
  -- Only show masked phone for public access, full phone only to post owner
  CASE 
    WHEN auth.uid() = user_id THEN phone
    ELSE public.mask_phone_number(phone)
  END as phone,
  user_id
FROM public.posts;

-- Step 4: Grant public access to the secure view instead of the table
REVOKE ALL ON public.posts FROM anon, authenticated;
GRANT SELECT ON public.posts_public TO authenticated, anon;

-- Step 5: Still allow authenticated users to perform CRUD operations on their own posts
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;