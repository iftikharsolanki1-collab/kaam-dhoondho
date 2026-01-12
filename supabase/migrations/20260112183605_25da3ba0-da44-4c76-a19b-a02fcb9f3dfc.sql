-- Create a SECURITY DEFINER function to get public profile data
-- This allows users to see names/avatars of others while protecting phone

CREATE OR REPLACE FUNCTION public.get_public_profile(target_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  avatar_url text,
  location text,
  phone text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.name,
    p.avatar_url,
    p.location,
    CASE 
      WHEN p.user_id = auth.uid() THEN p.phone
      ELSE NULL
    END AS phone
  FROM profiles p
  WHERE p.user_id = target_user_id
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_profile TO authenticated;

-- Drop the SECURITY INVOKER view and recreate with SECURITY DEFINER
-- so it can access profiles without the permissive policy
DROP VIEW IF EXISTS profiles_public;

CREATE VIEW profiles_public WITH (security_invoker = false) AS
SELECT 
  id,
  user_id,
  name,
  avatar_url,
  location,
  CASE 
    WHEN user_id = auth.uid() THEN phone
    ELSE NULL
  END AS phone
FROM profiles;

GRANT SELECT ON profiles_public TO authenticated;