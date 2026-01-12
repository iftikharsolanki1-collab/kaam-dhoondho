-- Add missing RLS policies for better functionality

-- Allow updating conversations (for last_message_at)
CREATE POLICY "Participants can update conversations"
ON conversations FOR UPDATE
TO authenticated
USING ((auth.uid() = participant1_id) OR (auth.uid() = participant2_id));

-- Allow deleting own contacts
CREATE POLICY "Users can delete own contacts"
ON post_contacts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow post owners to delete their phone numbers
CREATE POLICY "Post owner can delete phone"
ON post_phone_numbers FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND p.user_id = auth.uid())
);