-- Convert posts_secure view to use SECURITY INVOKER (safer approach)
-- This works because users can already see their own messages via RLS

DROP VIEW IF EXISTS posts_secure;

CREATE VIEW posts_secure WITH (security_invoker = true) AS
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

-- Grant SELECT on view to allow querying
GRANT SELECT ON posts_secure TO anon, authenticated;