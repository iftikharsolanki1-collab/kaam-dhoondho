
-- Create storage bucket for trending item images
INSERT INTO storage.buckets (id, name, public) VALUES ('trending-images', 'trending-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload trending images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'trending-images');

-- Allow public read
CREATE POLICY "Public can view trending images"
ON storage.objects FOR SELECT
USING (bucket_id = 'trending-images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete trending images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'trending-images');
