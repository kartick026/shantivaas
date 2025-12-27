-- Migration: Buildings
-- Stores building/property information

CREATE TABLE IF NOT EXISTS public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL CHECK (LENGTH(pincode) = 6),
  total_floors INTEGER NOT NULL CHECK (total_floors > 0),
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "admin_all_access_buildings"
  ON public.buildings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tenants can view buildings (needed to see their building info)
CREATE POLICY "tenants_view_buildings"
  ON public.buildings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'tenant'
    )
  );

-- Indexes
CREATE INDEX idx_buildings_active ON public.buildings(is_active) WHERE is_active = true;
CREATE INDEX idx_buildings_city ON public.buildings(city);

-- Updated timestamp trigger
CREATE TRIGGER update_buildings_updated_at
  BEFORE UPDATE ON public.buildings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.buildings IS 'Buildings/properties managed in the system';
COMMENT ON COLUMN public.buildings.total_floors IS 'Total number of floors in the building';
