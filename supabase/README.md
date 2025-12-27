# Shantivaas Database Schema

Complete PostgreSQL schema for the Shantivaas rental management platform using Supabase.

## 📊 Database Overview

### Core Entities
- **user_profiles**: Role-based user management (admin/tenant)
- **buildings**: Property information
- **floors**: Floor organization within buildings
- **rooms**: Individual rooms with capacity and rent
- **tenants**: Tenant assignments and individual rent
- **security_deposits**: Security deposit tracking with refunds

### Financial Entities
- **rent_cycles**: Auto-generated monthly rent records
- **payments**: All payment transactions (online + manual)

### Communication Entities
- **notifications**: Multi-channel notification system
- **reminders**: Auto-scheduled payment reminders

### Support Entities
- **complaints**: Tenant complaints and maintenance requests
- **audit_logs**: Complete audit trail for compliance

## 🔑 Business Rules Implemented

### Rent Management
1. **Room Rent Split**: Total room rent = sum of all tenant individual rents
2. **Editable Rent**: Admin can modify individual_rent (logged in audit)
3. **Room Clearance**: Room marked "CLEAR" when total payments = room rent
4. **Multi-month Dues**: Tenants can have multiple pending rent cycles

### Room Numbering
- ✅ **Same room numbers allowed on different floors**
  - Example: Floor 0 Room 101, Floor 1 Room 101, Floor 2 Room 101

### Payments
1. **Online Payments**: Via Razorpay, webhook-verified, immutable
2. **Manual Payments**: CASH/BANK/UPI, admin-tracked, editable
3. **Partial Payments**: Allowed, aggregated per rent cycle
4. **Receipt Generation**: Every payment gets a digital receipt

### Late Fees (Optional)
- Configurable per rent cycle
- Fields: `late_fee_applicable`, `late_fee_amount`, `late_fee_start_date`
- Not auto-calculated (admin decision)

### Security Deposits
- Tracked separately from monthly rent
- Status tracking: held, refunded, partially_refunded, forfeited
- Deduction tracking with reasons

### Notifications
- **Auto-stop**: Reminders stop immediately after payment
- **Multi-channel**: In-app, email, SMS, WhatsApp
- **Smart routing**: Only unpaid tenants receive reminders

## 🗂️ Migration Files

| Migration | Description |
|-----------|-------------|
| `20250101000001_user_profiles.sql` | User authentication and roles |
| `20250101000002_buildings.sql` | Building/property management |
| `20250101000003_floors.sql` | Floor organization |
| `20250101000004_rooms.sql` | Room details with rent |
| `20250101000005_tenants.sql` | Tenant assignments (editable rent) |
| `20250101000006_security_deposits.sql` | Security deposit tracking |
| `20250101000007_rent_cycles.sql` | Monthly rent generation |
| `20250101000008_payments.sql` | Payment tracking + triggers |
| `20250101000009_notifications.sql` | Notification system |
| `20250101000010_reminders.sql` | Auto-reminders |
| `20250101000011_complaints.sql` | Complaint management |
| `20250101000012_audit_logs.sql` | Audit trail |
| `20250101000013_helper_views_functions.sql` | Helper views/functions |
| `20250101000014_seed_data.sql` | Sample test data |

## 🚀 Setup Instructions

### Prerequisites
- Supabase account ([supabase.com](https://supabase.com))
- Supabase CLI installed (optional, for local development)

### Option 1: Using Supabase Dashboard

1. **Create New Project**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Run Migrations**
   - Go to SQL Editor in dashboard
   - Copy and run each migration file in order (001 → 014)
   - Verify success after each migration

3. **Enable RLS**
   - RLS is auto-enabled in migrations
   - Verify in Table Editor → Select table → RLS toggle is ON

### Option 2: Using Supabase CLI

```bash
# Initialize Supabase
supabase init

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply all migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > src/types/database.types.ts
```

### Post-Migration Setup

1. **Create Admin User**
   ```sql
   -- After admin signs up via Supabase Auth, run:
   INSERT INTO public.user_profiles (id, role, full_name, email, phone) 
   VALUES (
     'ADMIN_AUTH_USER_ID', 
     'admin', 
     'Admin Name', 
     'admin@shantivaas.com', 
     '+919876543210'
   );
   ```

2. **Generate Initial Rent Cycles**
   ```sql
   -- Generate rent for current month
   SELECT generate_monthly_rent_cycles(
     EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
     EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
   );
   ```

## 📈 Helper Views

### `room_status`
Get occupancy and rent allocation status for all rooms.

```sql
SELECT * FROM public.room_status WHERE occupancy_status = 'partial';
```

### `monthly_collection_summary`
Monthly rent collection statistics.

```sql
SELECT * FROM public.monthly_collection_summary 
WHERE due_year = 2025 AND due_month = 1;
```

### `tenant_dashboard`
Complete tenant dashboard data (pending payments, complaints, etc.).

```sql
SELECT * FROM public.tenant_dashboard WHERE user_id = 'TENANT_USER_ID';
```

## 🔧 Helper Functions

### `generate_monthly_rent_cycles(month, year)`
Auto-generate rent cycles for all active tenants.

```sql
-- Generate rent for January 2025
SELECT generate_monthly_rent_cycles(1, 2025);
```

### `get_room_clearance_status(room_id, month, year)`
Check if room rent is fully paid for a specific month.

```sql
SELECT * FROM get_room_clearance_status(
  '33333333-3333-3333-3333-333333333301'::UUID,
  1,
  2025
);
```

## 🔐 Row Level Security (RLS)

### Admin Access
- Full read/write access to all tables
- Can view audit logs
- Can mark manual payments

### Tenant Access
- **CAN** view own profile, room, rent cycles, payments
- **CAN** create online payments
- **CAN** submit complaints
- **CAN** view own notifications
- **CANNOT** see other tenants' data
- **CANNOT** modify payment records
- **CANNOT** delete anything

### Anonymous Access
- No access to any data (zero rows returned)

## 🧪 Testing Queries

```sql
-- Test: Verify all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Test: Verify RLS enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Test: Check triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Test: Room clearance calculation
SELECT 
  r.room_number,
  r.monthly_rent AS expected,
  COALESCE(SUM(p.amount), 0) AS collected,
  r.monthly_rent - COALESCE(SUM(p.amount), 0) AS pending
FROM rooms r
LEFT JOIN rent_cycles rc ON r.id = rc.room_id
LEFT JOIN payments p ON rc.id = p.rent_cycle_id
WHERE rc.due_month = 1 AND rc.due_year = 2025
GROUP BY r.id, r.room_number, r.monthly_rent;
```

## 📝 Notes

### Design Decisions

1. **Individual Rent is Editable**: Allows flexibility for tenant negotiations (logged in audit)
2. **Late Fees are Optional**: Admin can enable per rent cycle
3. **Security Deposits Separate**: Tracked independently from monthly rent
4. **Same Room Numbers Allowed**: Different floors can have Room 101, 102, etc.

### Database Triggers

1. `update_rent_cycle_status`: Auto-update when payment received
2. `stop_reminders_after_payment`: Cancel pending reminders on payment
3. `log_tenant_rent_change`: Audit trail for rent modifications
4. `log_manual_payment`: Track all manual payment entries
5. `notification_mark_read`: Auto-set read_at timestamp
6. `complaint_status_notification`: Notify tenant on complaint updates

### Performance Optimizations

- Indexed all foreign keys
- Partial indexes for active records
- Composite indexes for common queries (status + date)
- JSONB for flexible audit log storage

## 🔄 Next Steps

After completing database setup:

1. ✅ **PHASE 2**: Auth & Roles implementation
2. [ ] **PHASE 3**: Core rent logic (Edge Functions)
3. [ ] **PHASE 4**: Payment integration (Razorpay)
4. [ ] **PHASE 5**: Notifications & Automation
5. [ ] **PHASE 6**: Frontend dashboards
6. [ ] **PHASE 7**: Production deployment

## 📞 Support

For issues or questions about the schema:
1. Check migration file comments
2. Review RLS policies in each migration
3. Test with seed data first
