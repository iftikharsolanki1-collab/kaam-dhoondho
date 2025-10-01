-- Complete the security fix by removing phone column from posts table
-- All phone data is now safely stored in post_contacts table with strict RLS

-- Drop the phone column from posts table
ALTER TABLE public.posts DROP COLUMN IF EXISTS phone;

-- Verify: posts table now has no sensitive contact information
-- Contact info is only accessible via post_contacts table with owner-only RLS policies