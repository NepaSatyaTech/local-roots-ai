
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS on user_roles: admins can read all, users can read their own
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    category_icon TEXT DEFAULT '🏺',
    description TEXT DEFAULT '',
    importance TEXT DEFAULT '',
    daily_life_uses TEXT DEFAULT '',
    how_to_use TEXT DEFAULT '',
    ingredients TEXT DEFAULT '',
    cultural_background TEXT DEFAULT '',
    where_to_find TEXT DEFAULT '',
    price TEXT DEFAULT '',
    images TEXT[] DEFAULT '{}',
    availability TEXT DEFAULT 'available',
    location_country TEXT DEFAULT 'India',
    location_state TEXT DEFAULT '',
    location_district TEXT DEFAULT '',
    location_local_area TEXT DEFAULT '',
    featured BOOLEAN DEFAULT false,
    trending BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    review_status TEXT DEFAULT 'pending',
    review_comment TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Products RLS policies
-- Admins can do everything
CREATE POLICY "Admins full access" ON public.products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public can view approved products
CREATE POLICY "Public can view approved products" ON public.products
  FOR SELECT TO anon
  USING (review_status = 'approved' AND status = 'active');

-- Authenticated users can view approved products  
CREATE POLICY "Auth users view approved products" ON public.products
  FOR SELECT TO authenticated
  USING (review_status = 'approved' AND status = 'active');

-- Community submissions table
CREATE TABLE public.community_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,
    location TEXT NOT NULL,
    usage_details TEXT DEFAULT '',
    submitted_by TEXT NOT NULL,
    submitted_by_user_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.community_submissions ENABLE ROW LEVEL SECURITY;

-- Admins full access on submissions
CREATE POLICY "Admins full access submissions" ON public.community_submissions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Anyone can insert submissions
CREATE POLICY "Anyone can submit" ON public.community_submissions
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Auth users can submit" ON public.community_submissions
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Enable realtime for products
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_submissions;

-- Auto-create profile trigger to assign default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
