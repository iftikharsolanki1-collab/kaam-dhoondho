-- Drop the restrictive authenticated-only policy
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON public.posts;

-- Create a new policy that allows everyone (authenticated and anonymous) to view posts
-- This is appropriate for a job marketplace where jobs should be publicly viewable
CREATE POLICY "Anyone can view posts"
ON public.posts
FOR SELECT
TO public
USING (true);

-- Keep the other policies intact for authenticated users
-- (Users can create posts, update their own posts, delete their own posts)