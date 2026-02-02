-- Create app_role enum type for role-based access
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for managing admin access
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable Row Level Security on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create app_ads table for banner advertisements
CREATE TABLE public.app_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    position TEXT NOT NULL DEFAULT 'feed_bottom',
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on app_ads
ALTER TABLE public.app_ads ENABLE ROW LEVEL SECURITY;

-- Everyone can view active ads
CREATE POLICY "Anyone can view active ads"
ON public.app_ads
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Only admins can manage ads
CREATE POLICY "Admins can manage ads"
ON public.app_ads
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert into govt_schemes
CREATE POLICY "Admins can insert schemes"
ON public.govt_schemes
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update govt_schemes
CREATE POLICY "Admins can update schemes"
ON public.govt_schemes
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete govt_schemes
CREATE POLICY "Admins can delete schemes"
ON public.govt_schemes
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for posts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;