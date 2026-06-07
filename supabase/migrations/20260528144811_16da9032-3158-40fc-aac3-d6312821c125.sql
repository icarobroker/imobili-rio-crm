-- Property status enum
CREATE TYPE public.property_status AS ENUM ('disponivel', 'reservado', 'vendido', 'inativo');

-- Properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  property_type public.property_type NOT NULL DEFAULT 'apartamento',
  status public.property_status NOT NULL DEFAULT 'disponivel',
  price NUMERIC,
  address TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  parking_spots INTEGER,
  area_m2 NUMERIC,
  description TEXT,
  cover_url TEXT,
  reference_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own properties" ON public.properties
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own properties" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own properties" ON public.properties
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users delete own properties" ON public.properties
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER properties_set_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_properties_user ON public.properties(user_id);
CREATE INDEX idx_properties_status ON public.properties(status);