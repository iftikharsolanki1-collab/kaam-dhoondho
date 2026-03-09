
-- Create user_videos table for storing uploaded videos
CREATE TABLE public.user_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_videos ENABLE ROW LEVEL SECURITY;

-- Anyone can view videos (for trending page)
CREATE POLICY "Anyone can view videos"
ON public.user_videos FOR SELECT
USING (true);

-- Users can upload their own videos
CREATE POLICY "Users can insert own videos"
ON public.user_videos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own videos
CREATE POLICY "Users can delete own videos"
ON public.user_videos FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for user videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-videos', 'user-videos', true);

-- Storage policies for user-videos bucket
CREATE POLICY "Anyone can view user videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-videos');

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own videos from storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
