
CREATE TABLE public.trending_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_hi TEXT,
  description TEXT,
  description_hi TEXT,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  category TEXT DEFAULT 'Corporate',
  is_new BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trending_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active trending items"
ON public.trending_items FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can insert trending items"
ON public.trending_items FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update trending items"
ON public.trending_items FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete trending items"
ON public.trending_items FOR DELETE
USING (has_role(auth.uid(), 'admin'));
