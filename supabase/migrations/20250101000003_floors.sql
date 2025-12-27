-- Migration: Floors
-- Stores floor information within buildings

CREATE TABLE IF NOT EXISTS public.floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL CHECK (floor_number >= 0),
  total_rooms INTEGER NOT NULL CHECK (total_rooms > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(building_id, floor_number)
);

-- Enable RLS
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "admin_all_access_floors"
  ON public.floors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tenants can view floors
CREATE POLICY "tenants_view_floors"
  ON public.floors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'tenant'
    )
  );

-- Indexes
CREATE INDEX idx_floors_building_id ON public.floors(building_id);

-- Updated timestamp trigger
CREATE TRIGGER update_floors_updated_at
  BEFORE UPDATE ON public.floors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.floors IS 'Floors within buildings';
COMMENT ON COLUMN public.floors.floor_number IS 'Floor number (0 = ground floor)';
