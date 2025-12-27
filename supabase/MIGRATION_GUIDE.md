# 🚀 Migration Guide - Applying Schemas to Supabase

This guide explains how to apply all database migrations to your Supabase project.

## ✅ Fixed Issues

The following issues have been fixed in the migration files:

1. **Foreign Key Dependency**: Fixed `notifications.related_complaint_id` foreign key that referenced `complaints` table before it existed
2. **Type Consistency**: Fixed `payment_mode` type inconsistency - now uses ENUM type consistently
3. **Syntax Errors**: All SQL syntax verified and corrected

## 📋 Migration Files (Apply in Order)

1. `20250101000001_user_profiles.sql` - User authentication and roles
2. `20250101000002_buildings.sql` - Building/property management
3. `20250101000003_floors.sql` - Floor organization
4. `20250101000004_rooms.sql` - Room details with rent
5. `20250101000005_tenants.sql` - Tenant assignments
6. `20250101000006_security_deposits.sql` - Security deposit tracking
7. `20250101000007_rent_cycles.sql` - Monthly rent generation
8. `20250101000008_payments.sql` - Payment tracking
9. `20250101000009_notifications.sql` - Notification system
10. `20250101000010_reminders.sql` - Auto-reminders
11. `20250101000011_complaints.sql` - Complaint management
12. `20250101000012_audit_logs.sql` - Audit trail
13. `20250101000013_helper_views_functions.sql` - Helper views/functions
14. `20250101000014_seed_data.sql` - Sample test data (optional)

## 🎯 Method 1: Supabase Dashboard (Recommended)

### Step 1: Open SQL Editor
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Apply Migrations
For each migration file (in order):

1. Open the migration file from `supabase/migrations/`
2. Copy the entire contents
3. Paste into SQL Editor
4. Click **Run** (bottom right)
5. Verify **Success** message appears
6. Repeat for next migration

### Step 3: Verify
After applying all migrations:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## 🛠️ Method 2: Supabase CLI

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (get project ref from Supabase dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF
```

### Apply Migrations
```bash
# Navigate to project root
cd /path/to/shantivaas

# Apply all migrations
supabase db push

# Or apply specific migration
supabase migration up
```

## 📝 Method 3: Using MCP Server (If Configured)

If you have Supabase configured as an MCP server:

1. Ensure MCP server is running and connected
2. Use the MCP tools to execute SQL migrations
3. Apply migrations in order using the MCP interface

## 🔍 Verification Checklist

After applying migrations, verify:

- [ ] All 14 tables created successfully
- [ ] All ENUM types created (payment_mode, complaint_status, etc.)
- [ ] RLS enabled on all tables
- [ ] All indexes created
- [ ] All triggers and functions created
- [ ] Helper views created (room_status, monthly_collection_summary, tenant_dashboard)
- [ ] Helper functions created (generate_monthly_rent_cycles, get_room_clearance_status)

## 🐛 Troubleshooting

### Error: "relation does not exist"
- **Cause**: Migrations applied out of order
- **Fix**: Drop all tables and reapply in correct order

### Error: "type already exists"
- **Cause**: ENUM type already created
- **Fix**: The migration uses `DO $$ BEGIN ... EXCEPTION` to handle this gracefully

### Error: "foreign key constraint violation"
- **Cause**: Referenced table doesn't exist yet
- **Fix**: All foreign key dependencies have been fixed in the migrations

### Error: "permission denied"
- **Cause**: Using anon key instead of service role key
- **Fix**: Use service role key for migrations (only in backend/server)

## 📚 Additional Resources

- [Supabase SQL Editor Guide](https://supabase.com/docs/guides/database/tables)
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)
- [PostgreSQL Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)

## ✅ Post-Migration Steps

1. **Create Admin User**:
   ```sql
   -- After admin signs up via Supabase Auth
   INSERT INTO public.user_profiles (id, role, full_name, email, phone) 
   VALUES (
     'ADMIN_AUTH_USER_ID', 
     'admin', 
     'Admin Name', 
     'admin@shantivaas.com', 
     '+919876543210'
   );
   ```

2. **Generate Initial Rent Cycles**:
   ```sql
   SELECT generate_monthly_rent_cycles(
     EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
     EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
   );
   ```

3. **Verify RLS Policies**:
   - Test admin access
   - Test tenant access
   - Verify anonymous users have no access

## 🎉 Success!

Once all migrations are applied, your database schema is ready for the Shantivaas application!

