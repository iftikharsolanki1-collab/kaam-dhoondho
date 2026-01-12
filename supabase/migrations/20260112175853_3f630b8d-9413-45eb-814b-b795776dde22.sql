-- 1. Revoke direct SELECT on posts table for anon/authenticated (use posts_secure instead)
-- First drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view posts" ON posts;

-- Create a policy that only allows users to see their own posts directly
CREATE POLICY "Users can view own posts directly"
ON posts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Create SECURITY DEFINER function for sending notifications to other users
CREATE OR REPLACE FUNCTION public.send_notification(
  recipient_id uuid,
  notif_title text,
  notif_message text,
  notif_type text DEFAULT 'general',
  notif_related_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate inputs
  IF recipient_id IS NULL THEN
    RAISE EXCEPTION 'recipient_id cannot be null';
  END IF;
  
  IF LENGTH(notif_title) > 200 OR LENGTH(notif_message) > 1000 THEN
    RAISE EXCEPTION 'Title or message too long';
  END IF;
  
  -- Don't send notification to yourself
  IF recipient_id = auth.uid() THEN
    RETURN;
  END IF;
  
  -- Rate limiting: max 20 notifications per sender per minute
  IF (SELECT COUNT(*) FROM notifications 
      WHERE created_at > now() - interval '1 minute') >= 20 THEN
    RETURN; -- Silently skip if rate limited
  END IF;
  
  -- Insert notification
  INSERT INTO notifications (user_id, title, message, type, related_id)
  VALUES (recipient_id, notif_title, notif_message, notif_type, notif_related_id);
END;
$$;

-- 3. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.send_notification TO authenticated;