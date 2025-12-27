-- Migration: Reminders
-- Automated payment reminder tracking with auto-stop after payment

CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rent_cycle_id UUID NOT NULL REFERENCES public.rent_cycles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  reminder_date DATE NOT NULL,
  days_overdue INTEGER NOT NULL DEFAULT 0,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "admin_all_access_reminders"
  ON public.reminders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tenants can view their own reminders
CREATE POLICY "tenants_view_own_reminders"
  ON public.reminders
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_reminders_tenant_id ON public.reminders(tenant_id);
CREATE INDEX idx_reminders_rent_cycle_id ON public.reminders(rent_cycle_id);
CREATE INDEX idx_reminders_pending ON public.reminders(is_sent, reminder_date) 
  WHERE is_sent = FALSE;

-- Trigger: Stop reminders after payment
CREATE OR REPLACE FUNCTION stop_reminders_after_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark all pending reminders as sent when payment is made
  UPDATE public.reminders
  SET 
    is_sent = TRUE,
    sent_at = NOW()
  WHERE rent_cycle_id = NEW.rent_cycle_id
    AND is_sent = FALSE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_stops_reminders
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION stop_reminders_after_payment();

-- Comments
COMMENT ON TABLE public.reminders IS 'Payment reminders that auto-stop after payment';
COMMENT ON COLUMN public.reminders.days_overdue IS 'Number of days past due date';
