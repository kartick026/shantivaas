-- Migration: Complaints
-- Tenant complaint and maintenance request tracking

CREATE TYPE complaint_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE complaint_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  room_id UUID NOT NULL REFERENCES public.rooms(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('plumbing', 'electrical', 'cleaning', 'maintenance', 'noise', 'security', 'other')),
  priority complaint_priority DEFAULT 'medium',
  status complaint_status DEFAULT 'open',
  
  -- Assignment and resolution
  assigned_to UUID REFERENCES public.user_profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "admin_all_access_complaints"
  ON public.complaints
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tenants can create complaints
CREATE POLICY "tenants_create_complaint"
  ON public.complaints
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE user_id = auth.uid()
    )
  );

-- Tenants can view their own complaints
CREATE POLICY "tenants_view_own_complaints"
  ON public.complaints
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_complaints_tenant_id ON public.complaints(tenant_id);
CREATE INDEX idx_complaints_room_id ON public.complaints(room_id);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_priority ON public.complaints(priority);
CREATE INDEX idx_complaints_open ON public.complaints(status, created_at DESC) 
  WHERE status IN ('open', 'in_progress');

-- Updated timestamp trigger
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-set resolved_at when status changes to resolved
CREATE OR REPLACE FUNCTION set_complaint_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaint_resolved_timestamp
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION set_complaint_resolved_at();

-- Trigger: Notify tenant when complaint status changes
CREATE OR REPLACE FUNCTION notify_complaint_update()
RETURNS TRIGGER AS $$
DECLARE
  tenant_user_id UUID;
BEGIN
  -- Get tenant's user_id
  SELECT user_id INTO tenant_user_id
  FROM public.tenants
  WHERE id = NEW.tenant_id;
  
  -- Create notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    related_complaint_id
  ) VALUES (
    tenant_user_id,
    'complaint_update',
    'Complaint Update: ' || NEW.title,
    'Your complaint status has been updated to: ' || NEW.status,
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaint_status_notification
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION notify_complaint_update();

-- Add foreign key constraint for notifications (created after complaints table)
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_related_complaint_id_fkey 
  FOREIGN KEY (related_complaint_id) 
  REFERENCES public.complaints(id) 
  ON DELETE SET NULL;

-- Comments
COMMENT ON TABLE public.complaints IS 'Tenant complaints and maintenance requests';
COMMENT ON COLUMN public.complaints.category IS 'Type of complaint/issue';
COMMENT ON COLUMN public.complaints.priority IS 'Urgency level set by admin';
