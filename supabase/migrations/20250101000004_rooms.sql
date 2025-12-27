-- Migration: Rooms
-- Stores room information within floors
-- NOTE: Room numbers can be same on different floors (e.g., Floor 1 Room 101, Floor 2 Room 101)

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id UUID NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  monthly_rent DECIMAL(10, 2) NOT NULL CHECK (monthly_rent > 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "admin_all_access_rooms"
  ON public.rooms
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tenants can only see their assigned room
CREATE POLICY "tenants_view_own_room"
  ON public.rooms
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT room_id FROM public.tenants WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_rooms_floor_id ON public.rooms(floor_id);
CREATE INDEX idx_rooms_active ON public.rooms(is_active) WHERE is_active = true;
CREATE INDEX idx_rooms_room_number ON public.rooms(room_number);

-- Updated timestamp trigger
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.rooms IS 'Rooms within floors';
COMMENT ON COLUMN public.rooms.capacity IS 'Maximum number of tenants allowed';
COMMENT ON COLUMN public.rooms.monthly_rent IS 'Total monthly rent for the entire room';
