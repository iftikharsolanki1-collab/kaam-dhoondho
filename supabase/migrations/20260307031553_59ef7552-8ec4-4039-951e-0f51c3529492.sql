
-- Reports table
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can submit reports" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Users can view own reports
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports" ON public.reports
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update reports
CREATE POLICY "Admins can update reports" ON public.reports
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete reports
CREATE POLICY "Admins can delete reports" ON public.reports
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- User strikes table
CREATE TABLE public.user_strikes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reason text NOT NULL,
  strike_number int NOT NULL DEFAULT 1,
  ban_until timestamptz,
  is_permanent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  admin_id uuid
);

ALTER TABLE public.user_strikes ENABLE ROW LEVEL SECURITY;

-- Users can view own strikes
CREATE POLICY "Users can view own strikes" ON public.user_strikes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage strikes
CREATE POLICY "Admins can manage strikes" ON public.user_strikes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Unique constraint to prevent duplicate reports on same post by same user
CREATE UNIQUE INDEX reports_unique_per_user ON public.reports (post_id, reporter_id);
