-- Fix posts table - restrict to authenticated users only (remove public access)
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;

-- Only authenticated users can view posts
CREATE POLICY "Authenticated users can view posts" 
ON public.posts 
FOR SELECT 
TO authenticated
USING (true);