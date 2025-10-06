-- Fix: Require authentication to view posts
-- This prevents anonymous users from scraping worker contact information

-- Drop the existing public policy
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can view posts"
ON public.posts
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);