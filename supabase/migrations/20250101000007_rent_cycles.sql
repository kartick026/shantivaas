-- Migration: Rent Cycles
-- Auto-generated monthly rent records for each tenant
-- Includes optional late fee tracking

CREATE TABLE IF NOT EXISTS public.rent_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id),
  amount_due DECIMAL(10, 2) NOT NULL CHECK (amount_due > 0),
  due_month INTEGER NOT NULL CHECK (due_month BETWEEN 1 AND 12),
  due_year INTEGER NOT NULL CHECK (due_year >= 2024),
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'overdue', 'waived')) DEFAULT 'pending',
  
  -- Late fee tracking (optional)
  late_fee_applicable BOOLEAN DEFAULT FALSE,
  late_fee_amount DECIMAL(10, 2) CHECK (late_fee_amount >= 0),
  late_fee_start_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, due_month, due_year)
);

-- Enable RLS
ALTER TABLE public.rent_cycles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "admin_all_access_rent_cycles"
  ON public.rent_cycles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tenants can view their own rent cycles
CREATE POLICY "tenants_view_own_rent_cycles"
  ON public.rent_cycles
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_rent_cycles_tenant_id ON public.rent_cycles(tenant_id);
CREATE INDEX idx_rent_cycles_status ON public.rent_cycles(status);
CREATE INDEX idx_rent_cycles_due_date ON public.rent_cycles(due_date);
CREATE INDEX idx_rent_cycles_overdue ON public.rent_cycles(status, due_date) 
  WHERE status IN ('pending', 'overdue');

-- Updated timestamp trigger
CREATE TRIGGER update_rent_cycles_updated_at
  BEFORE UPDATE ON public.rent_cycles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update overdue status
CREATE OR REPLACE FUNCTION update_overdue_status()
RETURNS void AS $$
BEGIN
  UPDATE public.rent_cycles
  SET status = 'overdue'
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE public.rent_cycles IS 'Monthly rent records auto-generated for each tenant';
COMMENT ON COLUMN public.rent_cycles.amount_due IS 'Base rent amount (from tenant.individual_rent)';
COMMENT ON COLUMN public.rent_cycles.late_fee_amount IS 'Optional late fee added for overdue payments';
