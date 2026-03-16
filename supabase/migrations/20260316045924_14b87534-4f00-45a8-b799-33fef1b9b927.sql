
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '🏺',
  description text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT 'primary',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins full access categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.categories (name, icon, description, color, sort_order) VALUES
  ('Herbal Medicine', '🌿', 'Traditional healing remedies from nature', 'sage', 1),
  ('Local Food', '🍲', 'Authentic regional cuisines and ingredients', 'amber', 2),
  ('Handicrafts', '🎨', 'Handmade artisanal creations', 'terracotta', 3),
  ('Art & Artists', '🖌️', 'Local art forms and creators', 'primary', 4),
  ('Historical Books', '📚', 'Rare manuscripts and cultural texts', 'secondary', 5),
  ('Traditional Tools', '⚒️', 'Heritage implements and equipment', 'muted', 6),
  ('Cultural Products', '🏺', 'Items of cultural significance', 'accent', 7);
