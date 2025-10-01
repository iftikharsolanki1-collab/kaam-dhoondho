-- Fix Security Definer View and Phone Number Exposure
-- Drop the insecure posts_public view that bypasses RLS

-- Step 1: Drop the posts_public view completely
DROP VIEW IF EXISTS public.posts_public CASCADE;

-- Step 2: Revoke all public (anon) access to posts table
REVOKE ALL ON public.posts FROM anon;

-- Step 3: Ensure authenticated users have proper access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;

-- Step 4: Create policy for authenticated users to view all posts
-- Phone masking will be handled at the application layer via SecureJobCard component
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON public.posts;
CREATE POLICY "Authenticated users can view all posts" 
ON public.posts 
FOR SELECT 
TO authenticated
USING (true);

-- Note: Existing policies remain:
-- - "Users can view their own posts with full details" allows owners to see unmasked data
-- - Application layer (SecureJobCard.tsx) handles phone number masking for non-owners