# 🚀 Complete Setup Guide - Shantivaas

Complete step-by-step guide to get Shantivaas running locally.

## Prerequisites

- Node.js 18+ installed
- npm or yarn  
- Supabase account ([supabase.com](https://supabase.com))
- (Optional) Razorpay account for payments

---

## Part 1: Database Setup (10 minutes)

### Step 1: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: Shantivaas
   - **Database Password**: (save this!)
   - **Region**: ap-south-1 (Mumbai, India)
4. Click "Create new project"
5. Wait ~2 minutes for provisioning

### Step 2: Apply Database Migrations

1. Open Supabase project
2. Go to **SQL Editor** (left sidebar)
3. Click "New query"
4. Apply migrations in order:

```
supabase/migrations/20250101000001_user_profiles.sql
supabase/migrations/20250101000002_buildings.sql
... (continue through 20250101000014_seed_data.sql)
```

For each file:
- Copy entire content
- Paste into SQL Editor
- Click "Run" (bottom right)
- Verify "Success" message

### Step 3: Get API Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → Save for `.env.local`
   - **Anon/Public Key** → Save for `.env.local`

---

## Part 2: Frontend Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment

Create `.env.local` in `frontend/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Shantivaas
```

### Step 3: Run Development Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## Part 3: Create First Users

### Admin User

1. Go to Supabase → **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Fill:
   - **Email**: admin@shantivaas.com
   - **Auto Confirm Email**: ✅
4. Click "Create user"
5. **Copy the User UUID**

6. Go to **SQL Editor** → New query
7. Run:
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

### Tenant User (Optional)

Same process, but:
- Use different email/phone
- Set `role = 'tenant'`
- Need to assign to a room:
  ```sql
  INSERT INTO public.tenants (user_id, room_id, individual_rent, join_date)
  VALUES (
    'TENANT_USER_UUID',
    'ROOM_UUID_FROM_SEED_DATA',
    6000.00,
    CURRENT_DATE
  );
  ```

---

## Part 4: Test the System

### Test Admin Login

1. Visit [http://localhost:3000](http://localhost:3000)
2. Click **Email** tab
3. Enter: admin@shantivaas.com
4. Click "Send Magic Link"
5. Check Supabase logs for magic link (or check email if SMTP configured)
6. Click link → Should land on admin dashboard

### Test Tenant Login

1. Same process with tenant email
2. Or use **Phone (OTP)** tab
3. Enter phone number with country code: +919876543210
4. Note: OTP will appear in Supabase logs (SMS not configured yet)

---

## Part 5: Generate Test Data

```sql
-- Generate rent cycles for current month
SELECT generate_monthly_rent_cycles(
  EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
);

-- Verify
SELECT * FROM rent_cycles;
```

---

## Common Issues

### "Invalid session" error
- Check `.env.local` has correct Supabase URL and key
- Restart dev server after changing `.env.local`

### Magic link doesn't work
- Check Supabase Auth email settings
- For local dev, copy link from Supabase logs

### OTP not received
- OTP won't actually send SMS in dev mode
- Check Supabase logs for the OTP code
- Or configure Twilio in Supabase settings

### Dashboard shows no data
- Run seed data migration
- Generate rent cycles for current month
- Verify RLS policies are enabled

---

## Development Workflow

```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Watch logs
# (Open Supabase dashboard → Logs)

# Terminal 3: Database queries
# (Use Supabase SQL Editor)
```

---

## Next Steps

Once everything works:

1. **Phase 3**: Build tenant management UI
2. **Phase 4**: Integrate Razorpay payments
3. **Phase 5**: Add notifications (WhatsApp/SMS)
4. **Phase 6**: Deploy to production
5. **Phase 7**: Advanced features & reports

---

## Production Checklist

Before deploying:

- [ ] Change all default passwords
- [ ] Use production Supabase instance
- [ ] Configure custom SMTP for emails
- [ ] Set up Twilio/MSG91 for SMS
- [ ] Configure Razorpay production keys
- [ ] Enable SSL/HTTPS
- [ ] Set up backups
- [ ] Configure monitoring
- [ ] Test RLS policies thoroughly

---

## Support

- Database docs: `supabase/README.md`
- Frontend docs: `frontend/README.md`
- Project overview: `README.md`

**Status**: Phase 2 Complete! ✅

Last Updated: 2025-12-27
