-- Remove the phone column from posts table since phone data is now in post_phone_numbers
-- This ensures phone numbers are only accessible through the secure access control

ALTER TABLE posts DROP COLUMN IF EXISTS phone;