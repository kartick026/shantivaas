-- Migration: Payments
-- Stores all payment transactions (online + manual)
-- Online payments verified via Razorpay webhook, manual payments tracked by admin

CREATE TYPE payment_mode AS ENUM ('ONLINE_GATEWAY', 'CASH', 'BANK_TRANSFER', 'UPI_MANUAL');

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rent_cycle_id UUID NOT NULL REFERENCES public.rent_cycles(id),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  payment_mode payment_mode NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Razorpay fields (for ONLINE_GATEWAY)
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  
  -- Manual payment fields (for CASH, BANK_TRANSFER, UPI_MANUAL)
  received_by UUID REFERENCES public.user_profiles(id),
  notes TEXT,
  
  -- Receipt
  receipt_url TEXT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.user_profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: Online payments must have razorpay_payment_id
  CONSTRAINT check_online_payment CHECK (
    payment_mode != 'ONLINE_GATEWAY' OR razorpay_payment_id IS NOT NULL
  ),
  -- Constraint: Manual payments must have received_by
  CONSTRAINT check_manual_payment CHECK (
    payment_mode = 'ONLINE_GATEWAY' OR received_by IS NOT NULL
  )
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "admin_all_access_payments"
  ON public.payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tenants can view their own payments
CREATE POLICY "tenants_view_own_payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE user_id = auth.uid()
    )
  );

-- Tenants can create payments (for online gateway)
CREATE POLICY "tenants_create_payment"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE user_id = auth.uid()
    ) AND payment_mode = 'ONLINE_GATEWAY'
  );

-- Indexes
CREATE INDEX idx_payments_tenant_id ON public.payments(tenant_id);
CREATE INDEX idx_payments_rent_cycle_id ON public.payments(rent_cycle_id);
CREATE INDEX idx_payments_mode ON public.payments(payment_mode);
CREATE INDEX idx_payments_razorpay_order ON public.payments(razorpay_order_id) 
  WHERE razorpay_order_id IS NOT NULL;

-- Updated timestamp trigger
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update rent_cycle status after payment
CREATE OR REPLACE FUNCTION update_rent_cycle_status()
RETURNS TRIGGER AS $$
DECLARE
  total_paid DECIMAL(10, 2);
  cycle_amount DECIMAL(10, 2);
BEGIN
  -- Calculate total paid for this rent cycle
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM public.payments
  WHERE rent_cycle_id = NEW.rent_cycle_id;
  
  -- Get the amount due (including late fees)
  SELECT amount_due + COALESCE(late_fee_amount, 0) INTO cycle_amount
  FROM public.rent_cycles
  WHERE id = NEW.rent_cycle_id;
  
  -- Update status
  UPDATE public.rent_cycles
  SET 
    status = CASE 
      WHEN total_paid >= cycle_amount THEN 'paid'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = NEW.rent_cycle_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_updates_rent_cycle
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_rent_cycle_status();

-- Trigger: Log manual payments to audit
CREATE OR REPLACE FUNCTION log_manual_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_mode != 'ONLINE_GATEWAY' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      new_values
    ) VALUES (
      NEW.received_by,
      'manual_payment_created',
      'payment',
      NEW.id,
      to_jsonb(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER manual_payment_audit
  AFTER INSERT ON public.payments
  FOR EACH ROW
  WHEN (NEW.payment_mode != 'ONLINE_GATEWAY')
  EXECUTE FUNCTION log_manual_payment();

-- Comments
COMMENT ON TABLE public.payments IS 'All payment transactions with online and manual tracking';
COMMENT ON COLUMN public.payments.payment_mode IS 'Payment method used';
COMMENT ON COLUMN public.payments.is_verified IS 'Verified via webhook (online) or admin approval (manual)';
