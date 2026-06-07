-- Enum for journey stage keys (10 etapas do PRD)
CREATE TYPE public.journey_stage AS ENUM (
  'primeiro_contato', 'descoberta_valor', 'capacidade_financeira',
  'financiamento', 'permuta', 'visitas', 'proposta',
  'negociacao', 'fechamento', 'pos_venda'
);

-- Enum for relation status (lead <-> property)
CREATE TYPE public.lead_property_status AS ENUM (
  'sugerido', 'visitado', 'proposta', 'descartado'
);

-- Stages per lead
CREATE TABLE public.lead_journey_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  stage public.journey_stage NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lead_id, stage)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_journey_stages TO authenticated;
GRANT ALL ON public.lead_journey_stages TO service_role;
ALTER TABLE public.lead_journey_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own stages" ON public.lead_journey_stages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own stages" ON public.lead_journey_stages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own stages" ON public.lead_journey_stages
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users delete own stages" ON public.lead_journey_stages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER lead_journey_stages_set_updated_at
  BEFORE UPDATE ON public.lead_journey_stages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_journey_lead ON public.lead_journey_stages(lead_id);

-- Linked properties per lead
CREATE TABLE public.lead_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  relation_status public.lead_property_status NOT NULL DEFAULT 'sugerido',
  feedback TEXT,
  visited_at TIMESTAMPTZ,
  proposal_value NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lead_id, property_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_properties TO authenticated;
GRANT ALL ON public.lead_properties TO service_role;
ALTER TABLE public.lead_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own lead_props" ON public.lead_properties
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own lead_props" ON public.lead_properties
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own lead_props" ON public.lead_properties
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users delete own lead_props" ON public.lead_properties
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER lead_properties_set_updated_at
  BEFORE UPDATE ON public.lead_properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_lead_props_lead ON public.lead_properties(lead_id);
CREATE INDEX idx_lead_props_property ON public.lead_properties(property_id);