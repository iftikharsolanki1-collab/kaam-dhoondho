-- Drop the restrictive policy and create a public read policy for posts
DROP POLICY IF EXISTS "Users can view own posts directly" ON public.posts;

-- Allow everyone to view all posts (the posts_secure view handles phone masking)
CREATE POLICY "Anyone can view posts" 
ON public.posts 
FOR SELECT 
USING (true);