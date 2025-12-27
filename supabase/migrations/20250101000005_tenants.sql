-- Migration: Tenants
-- Stores tenant information and room assignments
-- Individual rent is editable by admin (changes logged in audit_logs)

CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  individual_rent DECIMAL(10, 2) NOT NULL CHECK (individual_rent > 0),
  join_date DATE NOT NULL,
  leave_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  emergency_contact TEXT,
  id_proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_leave_date CHECK (leave_date IS NULL OR leave_date >= join_date)
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "admin_all_access_tenants"
  ON public.tenants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tenants can only see their own record
CREATE POLICY "tenants_view_own_record"
  ON public.tenants
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_tenants_user_id ON public.tenants(user_id);
CREATE INDEX idx_tenants_room_id ON public.tenants(room_id);
CREATE INDEX idx_tenants_active ON public.tenants(is_active) WHERE is_active = true;

-- Updated timestamp trigger
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to log individual_rent changes
CREATE OR REPLACE FUNCTION log_tenant_rent_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.individual_rent != NEW.individual_rent THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      'individual_rent_updated',
      'tenant',
      NEW.id,
      jsonb_build_object('individual_rent', OLD.individual_rent),
      jsonb_build_object('individual_rent', NEW.individual_rent)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenant_rent_change_audit
  AFTER UPDATE ON public.tenants
  FOR EACH ROW
  WHEN (OLD.individual_rent IS DISTINCT FROM NEW.individual_rent)
  EXECUTE FUNCTION log_tenant_rent_change();

-- Comments
COMMENT ON TABLE public.tenants IS 'Tenant information and room assignments';
COMMENT ON COLUMN public.tenants.individual_rent IS 'Monthly rent amount for this specific tenant (editable by admin)';
COMMENT ON COLUMN public.tenants.id_proof_url IS 'URL to ID proof document in Supabase Storage';
