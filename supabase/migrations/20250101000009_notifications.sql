-- Migration: Notifications
-- Multi-channel notification system

CREATE TYPE notification_type AS ENUM (
  'payment_reminder',
  'payment_received',
  'complaint_update',
  'escalation_alert',
  'system_alert'
);

CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'read');

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status notification_status DEFAULT 'pending',
  
  -- Multi-channel delivery tracking
  in_app_read BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  
  -- Related entities (for context)
  related_payment_id UUID REFERENCES public.payments(id),
  related_complaint_id UUID, -- Foreign key added in complaints migration
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "admin_all_access_notifications"
  ON public.notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view their own notifications
CREATE POLICY "users_view_own_notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "users_update_own_notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_status ON public.notifications(status);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, in_app_read) 
  WHERE in_app_read = FALSE;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Trigger: Auto-update read_at timestamp
CREATE OR REPLACE FUNCTION update_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.in_app_read = TRUE AND OLD.in_app_read = FALSE THEN
    NEW.read_at = NOW();
    NEW.status = 'read';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_mark_read
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  WHEN (NEW.in_app_read IS DISTINCT FROM OLD.in_app_read)
  EXECUTE FUNCTION update_notification_read_at();

-- Comments
COMMENT ON TABLE public.notifications IS 'Multi-channel notification system';
COMMENT ON COLUMN public.notifications.type IS 'Notification category';
COMMENT ON COLUMN public.notifications.status IS 'Overall notification status';
