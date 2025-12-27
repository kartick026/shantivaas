-- Migration: Audit Logs
-- Complete audit trail for all critical actions

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only admins can view audit logs
CREATE POLICY "admin_all_access_audit_logs"
  ON public.audit_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- Comments
COMMENT ON TABLE public.audit_logs IS 'Audit trail for all critical system actions';
COMMENT ON COLUMN public.audit_logs.action IS 'Action performed (e.g., payment_marked, rent_updated)';
COMMENT ON COLUMN public.audit_logs.old_values IS 'Previous values before change (JSONB)';
COMMENT ON COLUMN public.audit_logs.new_values IS 'New values after change (JSONB)';
