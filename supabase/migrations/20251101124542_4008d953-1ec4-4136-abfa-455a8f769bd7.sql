-- Add INSERT policy for notifications table to prevent spam attacks
-- Only allow users to create notifications for themselves (legitimate use case)
-- System-generated notifications should be created via a SECURITY DEFINER function
CREATE POLICY "Users can create their own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add policy to allow authenticated users to view other profiles for chat functionality
-- This maintains security while enabling legitimate use cases
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);