-- 1. Create separate table for sensitive phone numbers
CREATE TABLE public.post_phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS on the new table
ALTER TABLE public.post_phone_numbers ENABLE ROW LEVEL SECURITY;

-- 3. Migrate existing phone data from posts
INSERT INTO public.post_phone_numbers (post_id, phone)
SELECT id, phone FROM posts WHERE phone IS NOT NULL AND phone != '';

-- 4. RLS: Only post owner or users who have contacted can see phone
CREATE POLICY "Post owner can view phone"
ON post_phone_numbers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM posts p WHERE p.id = post_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users with contact can view phone"
ON post_phone_numbers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM post_contacts pc WHERE pc.post_id = post_phone_numbers.post_id AND pc.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM messages m
    JOIN posts p ON p.id = post_phone_numbers.post_id
    WHERE (m.sender_id = auth.uid() AND m.receiver_id = p.user_id)
       OR (m.receiver_id = auth.uid() AND m.sender_id = p.user_id)
  )
);

-- 5. Post owner can insert/update their own phone
CREATE POLICY "Post owner can insert phone"
ON post_phone_numbers FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND p.user_id = auth.uid())
);

CREATE POLICY "Post owner can update phone"
ON post_phone_numbers FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND p.user_id = auth.uid())
);

-- 6. Update posts_secure view to use the new table
DROP VIEW IF EXISTS posts_secure;

CREATE VIEW posts_secure WITH (security_invoker = false) AS
SELECT 
  p.id,
  p.created_at,
  p.updated_at,
  p.user_id,
  p.is_urgent,
  p.is_verified,
  p.category_id,
  p.skill_id,
  p.name,
  p.photos,
  p.video_url,
  p.experience,
  p.title,
  p.description,
  p.location,
  p.rate,
  p.type,
  -- Phone only visible to owner or users with contact/message relationship
  CASE 
    WHEN p.user_id = auth.uid() THEN pn.phone
    WHEN EXISTS (
      SELECT 1 FROM post_contacts pc WHERE pc.post_id = p.id AND pc.user_id = auth.uid()
    ) THEN pn.phone
    WHEN EXISTS (
      SELECT 1 FROM messages m 
      WHERE (m.sender_id = auth.uid() AND m.receiver_id = p.user_id)
         OR (m.receiver_id = auth.uid() AND m.sender_id = p.user_id)
    ) THEN pn.phone
    ELSE NULL
  END AS phone
FROM posts p
LEFT JOIN post_phone_numbers pn ON pn.post_id = p.id;

-- 7. Grant SELECT on view
GRANT SELECT ON posts_secure TO anon, authenticated;

-- 8. Clear phone from posts table (data now in separate table)
UPDATE posts SET phone = NULL WHERE phone IS NOT NULL;