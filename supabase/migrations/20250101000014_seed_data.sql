-- Migration: Seed Data for Testing
-- Sample data to test the system

-- NOTE: This seed data is for development/testing only
-- Run this AFTER initial user signup in Supabase Auth

-- Insert sample admin user profile (replace UUID with actual auth.users id after signup)
-- Example: After admin signs up, get their ID and insert here
/*
INSERT INTO public.user_profiles (id, role, full_name, email, phone) VALUES
  ('REPLACE_WITH_ADMIN_USER_ID', 'admin', 'Admin User', 'admin@shantivaas.com', '+919876543210');
*/

-- Insert sample building
INSERT INTO public.buildings (id, name, address, city, state, pincode, total_floors) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Shantivaas PG', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', 3);

-- Insert floors
INSERT INTO public.floors (id, building_id, floor_number, total_rooms) VALUES
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 0, 4),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 1, 4),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 2, 4);

-- Insert rooms (demonstrating same room numbers on different floors)
INSERT INTO public.rooms (id, floor_id, room_number, capacity, monthly_rent, description) VALUES
  -- Ground Floor
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222221', '101', 2, 12000.00, 'Double occupancy with attached bathroom'),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222221', '102', 3, 15000.00, 'Triple occupancy'),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222221', '103', 2, 12000.00, 'Double occupancy'),
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222221', '104', 4, 18000.00, 'Four bed room'),
  
  -- First Floor (same room numbers)
  ('33333333-3333-3333-3333-333333333311', '22222222-2222-2222-2222-222222222222', '101', 2, 13000.00, 'Double occupancy with balcony'),
  ('33333333-3333-3333-3333-333333333312', '22222222-2222-2222-2222-222222222222', '102', 3, 16000.00, 'Triple occupancy with balcony'),
  ('33333333-3333-3333-3333-333333333313', '22222222-2222-2222-2222-222222222222', '103', 2, 13000.00, 'Double occupancy'),
  ('33333333-3333-3333-3333-333333333314', '22222222-2222-2222-2222-222222222222', '104', 4, 19000.00, 'Four bed room'),
  
  -- Second Floor (same room numbers)
  ('33333333-3333-3333-3333-333333333321', '22222222-2222-2222-2222-222222222223', '101', 2, 14000.00, 'Premium double occupancy'),
  ('33333333-3333-3333-3333-333333333322', '22222222-2222-2222-2222-222222222223', '102', 3, 17000.00, 'Premium triple occupancy'),
  ('33333333-3333-3333-3333-333333333323', '22222222-2222-2222-2222-222222222223', '103', 2, 14000.00, 'Premium double'),
  ('33333333-3333-3333-3333-333333333324', '22222222-2222-2222-2222-222222222223', '104', 4, 20000.00, 'Premium four bed');

-- Insert sample tenant user profiles (after tenant signup)
/*
-- After tenants sign up, insert their profiles like this:
INSERT INTO public.user_profiles (id, role, full_name, email, phone) VALUES
  ('TENANT1_USER_ID', 'tenant', 'Rahul Kumar', 'rahul@example.com', '+919876543211'),
  ('TENANT2_USER_ID', 'tenant', 'Priya Sharma', 'priya@example.com', '+919876543212'),
  ('TENANT3_USER_ID', 'tenant', 'Amit Patel', 'amit@example.com', '+919876543213');

-- Then insert tenant records:
INSERT INTO public.tenants (id, user_id, room_id, individual_rent, join_date) VALUES
  ('44444444-4444-4444-4444-444444444441', 'TENANT1_USER_ID', '33333333-3333-3333-3333-333333333301', 6000.00, '2025-01-01'),
  ('44444444-4444-4444-4444-444444444442', 'TENANT2_USER_ID', '33333333-3333-3333-3333-333333333301', 6000.00, '2025-01-01'),
  ('44444444-4444-4444-4444-444444444443', 'TENANT3_USER_ID', '33333333-3333-3333-3333-333333333302', 5000.00, '2025-01-01');
*/

-- Insert sample security deposits
/*
INSERT INTO public.security_deposits (tenant_id, amount, payment_mode, received_by, status) VALUES
  ('44444444-4444-4444-4444-444444444441', 12000.00, 'BANK_TRANSFER', 'ADMIN_USER_ID', 'held'),
  ('44444444-4444-4444-4444-444444444442', 12000.00, 'CASH', 'ADMIN_USER_ID', 'held'),
  ('44444444-4444-4444-4444-444444444443', 15000.00, 'UPI_MANUAL', 'ADMIN_USER_ID', 'held');
*/

-- Generate rent cycles for current month
/*
SELECT generate_monthly_rent_cycles(
  EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
);
*/

-- Insert sample complaint
/*
INSERT INTO public.complaints (tenant_id, room_id, title, description, category, priority) VALUES
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333301', 'Leaking tap', 'The bathroom tap is leaking continuously', 'plumbing', 'medium');
*/

-- Comments
COMMENT ON TABLE public.buildings IS 'Sample building data created';
COMMENT ON TABLE public.floors IS 'Sample floors demonstrating 0-indexed floor numbering';
COMMENT ON TABLE public.rooms IS 'Sample rooms showing same room numbers on different floors';
