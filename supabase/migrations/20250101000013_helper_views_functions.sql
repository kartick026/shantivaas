-- Migration: Helper Views and Functions
-- Common queries and business logic helpers

-- View: Room occupancy and payment status
CREATE OR REPLACE VIEW public.room_status AS
SELECT 
  r.id AS room_id,
  r.room_number,
  f.floor_number,
  b.name AS building_name,
  r.monthly_rent AS total_room_rent,
  r.capacity,
  COUNT(DISTINCT t.id) FILTER (WHERE t.is_active = TRUE) AS current_tenants,
  COALESCE(SUM(t.individual_rent) FILTER (WHERE t.is_active = TRUE), 0) AS total_individual_rent,
  r.monthly_rent - COALESCE(SUM(t.individual_rent) FILTER (WHERE t.is_active = TRUE), 0) AS rent_difference,
  CASE 
    WHEN COUNT(DISTINCT t.id) FILTER (WHERE t.is_active = TRUE) = 0 THEN 'vacant'
    WHEN COUNT(DISTINCT t.id) FILTER (WHERE t.is_active = TRUE) = r.capacity THEN 'full'
    ELSE 'partial'
  END AS occupancy_status
FROM public.rooms r
JOIN public.floors f ON r.floor_id = f.id
JOIN public.buildings b ON f.building_id = b.id
LEFT JOIN public.tenants t ON r.id = t.room_id
WHERE r.is_active = TRUE
GROUP BY r.id, r.room_number, f.floor_number, b.name, r.monthly_rent, r.capacity;

COMMENT ON VIEW public.room_status IS 'Room occupancy and rent allocation status';

-- View: Monthly rent collection summary
CREATE OR REPLACE VIEW public.monthly_collection_summary AS
SELECT 
  rc.due_month,
  rc.due_year,
  COUNT(DISTINCT rc.id) AS total_rent_cycles,
  COUNT(DISTINCT rc.id) FILTER (WHERE rc.status = 'paid') AS paid_count,
  COUNT(DISTINCT rc.id) FILTER (WHERE rc.status = 'pending') AS pending_count,
  COUNT(DISTINCT rc.id) FILTER (WHERE rc.status = 'overdue') AS overdue_count,
  COALESCE(SUM(rc.amount_due), 0) AS total_expected,
  COALESCE(SUM(p.amount), 0) AS total_collected,
  COALESCE(SUM(rc.amount_due), 0) - COALESCE(SUM(p.amount), 0) AS total_pending
FROM public.rent_cycles rc
LEFT JOIN public.payments p ON rc.id = p.rent_cycle_id
GROUP BY rc.due_month, rc.due_year
ORDER BY rc.due_year DESC, rc.due_month DESC;

COMMENT ON VIEW public.monthly_collection_summary IS 'Monthly rent collection statistics';

-- View: Tenant dashboard data
CREATE OR REPLACE VIEW public.tenant_dashboard AS
SELECT 
  t.id AS tenant_id,
  t.user_id,
  up.full_name,
  up.email,
  up.phone,
  r.room_number,
  f.floor_number,
  b.name AS building_name,
  t.individual_rent,
  t.join_date,
  COUNT(DISTINCT rc.id) FILTER (WHERE rc.status IN ('pending', 'overdue')) AS pending_payments_count,
  COALESCE(SUM(rc.amount_due) FILTER (WHERE rc.status IN ('pending', 'overdue')), 0) AS total_due_amount,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status IN ('open', 'in_progress')) AS open_complaints_count
FROM public.tenants t
JOIN public.user_profiles up ON t.user_id = up.id
LEFT JOIN public.rooms r ON t.room_id = r.id
LEFT JOIN public.floors f ON r.floor_id = f.id
LEFT JOIN public.buildings b ON f.building_id = b.id
LEFT JOIN public.rent_cycles rc ON t.id = rc.tenant_id
LEFT JOIN public.complaints c ON t.id = c.tenant_id
WHERE t.is_active = TRUE
GROUP BY t.id, t.user_id, up.full_name, up.email, up.phone, 
         r.room_number, f.floor_number, b.name, t.individual_rent, t.join_date;

COMMENT ON VIEW public.tenant_dashboard IS 'Complete tenant dashboard data';

-- Function: Generate monthly rent cycles
CREATE OR REPLACE FUNCTION generate_monthly_rent_cycles(
  target_month INTEGER,
  target_year INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  cycles_created INTEGER := 0;
  tenant_record RECORD;
BEGIN
  -- Validate inputs
  IF target_month < 1 OR target_month > 12 THEN
    RAISE EXCEPTION 'Invalid month: %', target_month;
  END IF;
  
  IF target_year < 2024 THEN
    RAISE EXCEPTION 'Invalid year: %', target_year;
  END IF;
  
  -- Generate rent cycles for all active tenants
  FOR tenant_record IN 
    SELECT id, room_id, individual_rent 
    FROM public.tenants 
    WHERE is_active = TRUE
  LOOP
    -- Insert rent cycle (ignore if already exists due to UNIQUE constraint)
    INSERT INTO public.rent_cycles (
      tenant_id,
      room_id,
      amount_due,
      due_month,
      due_year,
      due_date,
      status
    ) VALUES (
      tenant_record.id,
      tenant_record.room_id,
      tenant_record.individual_rent,
      target_month,
      target_year,
      make_date(target_year, target_month, 1),
      'pending'
    )
    ON CONFLICT (tenant_id, due_month, due_year) DO NOTHING;
    
    IF FOUND THEN
      cycles_created := cycles_created + 1;
    END IF;
  END LOOP;
  
  RETURN cycles_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION generate_monthly_rent_cycles IS 'Auto-generate rent cycles for all active tenants for a given month';

-- Function: Get room clearance status
CREATE OR REPLACE FUNCTION get_room_clearance_status(
  p_room_id UUID,
  p_month INTEGER,
  p_year INTEGER
)
RETURNS TABLE (
  room_id UUID,
  is_clear BOOLEAN,
  total_expected DECIMAL(10, 2),
  total_paid DECIMAL(10, 2),
  total_pending DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_room_id AS room_id,
    (COALESCE(SUM(p.amount), 0) >= r.monthly_rent) AS is_clear,
    r.monthly_rent AS total_expected,
    COALESCE(SUM(p.amount), 0) AS total_paid,
    r.monthly_rent - COALESCE(SUM(p.amount), 0) AS total_pending
  FROM public.rooms r
  LEFT JOIN public.rent_cycles rc ON r.id = rc.room_id 
    AND rc.due_month = p_month 
    AND rc.due_year = p_year
  LEFT JOIN public.payments p ON rc.id = p.rent_cycle_id
  WHERE r.id = p_room_id
  GROUP BY r.id, r.monthly_rent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_room_clearance_status IS 'Check if room rent is fully paid for a given month';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_monthly_rent_cycles TO authenticated;
GRANT EXECUTE ON FUNCTION get_room_clearance_status TO authenticated;
