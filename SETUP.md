# 🚀 Quick Setup Guide - Shantivaas

## Phase 1 Complete ✅

The database schema is ready! Follow these steps to set up your Supabase database.

---

## Step 1: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: Shantivaas
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users (e.g., `ap-south-1` for India)
4. Click "Create new project"
5. Wait for provisioning (~2 minutes)

---

## Step 2: Get Your Credentials

1. In your project, go to **Settings** → **API**
2. Copy these values:
   ```
   Project URL: https://xxxxx.supabase.co
   Anon/Public Key: eyJhbGci...
   Service Role Key: eyJhbGci... (keep secret!)
   ```

3. Create `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your credentials

---

## Step 3: Apply Database Migrations

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Open your Supabase project
2. Go to **SQL Editor** in left sidebar
3. Click "New query"
4. Copy contents of migration files **in order**:

```
migrations/20250101000001_user_profiles.sql
migrations/20250101000002_buildings.sql
migrations/20250101000003_floors.sql
migrations/20250101000004_rooms.sql
migrations/20250101000005_tenants.sql
migrations/20250101000006_security_deposits.sql
migrations/20250101000007_rent_cycles.sql
migrations/20250101000008_payments.sql
migrations/20250101000009_notifications.sql
migrations/20250101000010_reminders.sql
migrations/20250101000011_complaints.sql
migrations/20250101000012_audit_logs.sql
migrations/20250101000013_helper_views_functions.sql
migrations/20250101000014_seed_data.sql
```

5. Paste each file's content into SQL Editor
6. Click "Run" (bottom right)
7. Verify "Success" message
8. Repeat for ALL 14 files in order

### Option B: Using Supabase CLI (For developers)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

---

## Step 4: Verify Database Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - user_profiles
   - buildings
   - floors
   - rooms
   - tenants
   - security_deposits
   - rent_cycles
   - payments
   - notifications
   - reminders
   - complaints
   - audit_logs

3. Click any table → Look for 🔒 **RLS enabled** badge

---

## Step 5: Create Admin User

1. Go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Fill in:
   - **Email**: admin@shantivaas.com (or your email)
   - **Auto Confirm Email**: ✅ checked
4. Click "Create user"
5. Copy the User UUID

6. Go to **SQL Editor** → New query
7. Paste and run:
   ```sql
   INSERT INTO public.user_profiles (id, role, full_name, email, phone) 
   VALUES (
     'PASTE_USER_UUID_HERE', 
     'admin', 
     'Admin Name', 
     'admin@shantivaas.com', 
     '+919876543210'
   );
   ```

---

## Step 6: Test with Seed Data

The seed data migration already created:
- ✅ 1 Building (Shantivaas PG)
- ✅ 3 Floors (Ground, First, Second)
- ✅ 12 Rooms (4 per floor, with same room numbers)

Verify:
```sql
-- Check buildings
SELECT * FROM public.buildings;

-- Check room status
SELECT * FROM public.room_status;
```

---

## Step 7: Generate Test Rent Cycles

```sql
-- Generate rent for January 2025
SELECT generate_monthly_rent_cycles(1, 2025);
```

---

## 🎯 Next: Phase 2 - Frontend Setup

Now that database is ready, we'll build:
1. Authentication system (OTP for tenants)
2. Admin dashboard
3. Tenant dashboard
4. Razorpay payment integration

---

## ⚠️ Important Security Notes

1. **Never commit `.env.local`** - It contains secrets!
2. **Service Role Key** - Keep it secret, never expose to frontend
3. **RLS Policies** - Already enabled, verify they work:
   ```sql
   -- Test as tenant (should see only own data)
   SET request.jwt.claims = '{"sub": "tenant_uuid"}';
   SELECT * FROM payments;
   ```

---

## 📞 Troubleshooting

### Migration fails
- Check if previous migrations ran successfully
- Verify you're running them in order (001 → 014)
- Check for typos in table references

### RLS not working
- Verify RLS is enabled: Table Editor → Select table → Check 🔒 icon
- Check policies: Go to Authentication → Policies

### Can't create admin user
- Verify user UUID is correct (from Authentication → Users)
- Ensure user_profiles migration ran successfully

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] All 14 migrations applied successfully
- [ ] All 12 tables visible in Table Editor
- [ ] RLS enabled on all tables
- [ ] Admin user created and verified
- [ ] Seed data loaded (1 building, 3 floors, 12 rooms)
- [ ] Helper views working (`room_status`, etc.)
- [ ] Test rent cycles generated

**Once all checked, you're ready for Phase 2!** 🚀

---

## 📚 Helpful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Database README](./supabase/README.md) - Detailed schema docs
- [Project README](./README.md) - Full project overview
