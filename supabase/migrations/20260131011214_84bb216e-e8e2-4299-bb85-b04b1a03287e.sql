-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
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

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update exam_categories RLS to allow admin operations
CREATE POLICY "Admins can manage categories"
ON public.exam_categories
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update exams RLS to allow admin operations
CREATE POLICY "Admins can manage exams"
ON public.exams
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update resources RLS to allow admin operations
CREATE POLICY "Admins can manage resources"
ON public.resources
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update announcements RLS to allow admin operations
CREATE POLICY "Admins can manage announcements"
ON public.announcements
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update site_settings RLS to allow admin operations
CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for resources
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

-- Storage policies for resources bucket
CREATE POLICY "Anyone can view resource files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'resources');

CREATE POLICY "Admins can upload resource files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'resources' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update resource files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'resources' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete resource files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'resources' AND public.has_role(auth.uid(), 'admin'));