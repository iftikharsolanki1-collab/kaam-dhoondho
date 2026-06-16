DROP POLICY IF EXISTS "Authenticated users can upload trending images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete trending images" ON storage.objects;

CREATE POLICY "Admins can upload trending images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'trending-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete trending images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'trending-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update trending images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'trending-images' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'trending-images' AND public.has_role(auth.uid(), 'admin'));