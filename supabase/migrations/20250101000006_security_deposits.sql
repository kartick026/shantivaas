-- Migration: Security Deposits
-- Tracks security deposit payments, refunds, and deductions

-- Create payment_mode ENUM type (used by both security_deposits and payments)
DO $$ BEGIN
  CREATE TYPE payment_mode AS ENUM ('ONLINE_GATEWAY', 'CASH', 'BANK_TRANSFER', 'UPI_MANUAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.security_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  payment_mode payment_mode NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('held', 'refunded', 'partially_refunded', 'forfeited')) DEFAULT 'held',
  
  -- Refund details
  refund_amount DECIMAL(10, 2) CHECK (refund_amount >= 0),
  deduction_amount DECIMAL(10, 2) CHECK (deduction_amount >= 0),
  deduction_reason TEXT,
  refund_date TIMESTAMPTZ,
  refunded_by UUID REFERENCES public.user_profiles(id),
  
  -- Payment tracking
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  received_by UUID REFERENCES public.user_profiles(id),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT check_refund_amount CHECK (
    refund_amount IS NULL OR 
    (refund_amount + COALESCE(deduction_amount, 0)) <= amount
  )
);

-- Enable RLS
ALTER TABLE public.security_deposits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "admin_all_access_security_deposits"
  ON public.security_deposits
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tenants can view their own deposits
CREATE POLICY "tenants_view_own_deposits"
  ON public.security_deposits
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_security_deposits_tenant_id ON public.security_deposits(tenant_id);
CREATE INDEX idx_security_deposits_status ON public.security_deposits(status);

-- Updated timestamp trigger
CREATE TRIGGER update_security_deposits_updated_at
  BEFORE UPDATE ON public.security_deposits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.security_deposits IS 'Security deposit tracking with refund/deduction management';
COMMENT ON COLUMN public.security_deposits.status IS 'Current status of the deposit';
COMMENT ON COLUMN public.security_deposits.deduction_amount IS 'Amount deducted from deposit (e.g., damages)';
