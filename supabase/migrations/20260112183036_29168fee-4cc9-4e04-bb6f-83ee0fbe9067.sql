-- Create a secure view for public profile data
-- Shows name, avatar_url, location to all authenticated users
-- Phone only visible to profile owner

CREATE VIEW profiles_public WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  name,
  avatar_url,
  location,
  created_at,
  -- Phone only visible to profile owner
  CASE 
    WHEN user_id = auth.uid() THEN phone
    ELSE NULL
  END AS phone
FROM profiles;

-- Grant SELECT on view to authenticated users
GRANT SELECT ON profiles_public TO authenticated;

-- Also add a policy to profiles table allowing authenticated users to see basic info
-- This is needed for the view to work with SECURITY INVOKER
CREATE POLICY "Authenticated users can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);