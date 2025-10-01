-- Separate sensitive phone data into a secure table with strict RLS
-- Following best practice: sensitive data should be in a separate table

-- Step 1: Create post_contacts table for sensitive contact information
CREATE TABLE IF NOT EXISTS public.post_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  phone text NOT NULL,
  owner_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id)
);

-- Step 2: Enable RLS on post_contacts
ALTER TABLE public.post_contacts ENABLE ROW LEVEL SECURITY;

-- Step 3: Migrate existing phone numbers to post_contacts
INSERT INTO public.post_contacts (post_id, phone, owner_id)
SELECT id, phone, user_id 
FROM public.posts
WHERE phone IS NOT NULL AND phone != ''
ON CONFLICT (post_id) DO NOTHING;

-- Step 4: Create strict RLS policies - only owner can see phone
CREATE POLICY "Owners can view their own contact info"
ON public.post_contacts
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert their own contact info"
ON public.post_contacts
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their own contact info"
ON public.post_contacts
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their own contact info"
ON public.post_contacts
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Step 5: Drop phone column from posts (after migration is confirmed working)
-- COMMENTED OUT for safety - uncomment after verifying the migration works:
-- ALTER TABLE public.posts DROP COLUMN IF EXISTS phone;

-- Note: Keep phone column temporarily for backward compatibility
-- The application will be updated to use post_contacts table for phone numbers