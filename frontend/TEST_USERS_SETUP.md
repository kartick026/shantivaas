# 📱 Test Users Setup - Admin & Tenant (Phone & Email)

## Overview

This guide shows you how to set up **two distinct test users** (Admin and Tenant) using **phone login** or **email login** for testing the application.

## 📋 Quick Reference - Test Credentials

### Phone Login
| User Type | Phone Number | OTP | Role | Dashboard |
|-----------|--------------|-----|------|-----------|
| **Admin** | `+919999999999` | `000000` | Admin | `/admin/dashboard` |
| **Tenant** | `+918888888888` | `000000` | Tenant | `/tenant/dashboard` |

### Email Login
| User Type | Email | Role | Dashboard |
|-----------|-------|------|-----------|
| **Admin** | `admin@shantivaas.test` | Admin | `/admin/dashboard` |
| **Tenant** | `tenant@shantivaas.test` | Tenant | `/tenant/dashboard` |

**Note**: For email login, you'll receive a magic link. Use any email address you have access to, or disable custom SMTP to use Supabase's default email service.

## ✅ Prerequisites

### 1. Enable Authentication Providers in Supabase

**For Phone Login:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Authentication** → **Providers**
3. Enable **Phone** provider
4. Save

**For Email Login:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider
4. **For Testing**: Disable "Enable Custom SMTP" (use Supabase default email)
   - Go to **Settings** → **Auth** → **SMTP Settings**
   - Turn OFF "Enable Custom SMTP"
   - This allows ~3 emails/hour on free tier
5. Save

### 2. Required SQL Policy (IMPORTANT!)

**You must run this SQL first**, otherwise profile creation will fail:

```sql
-- Allow users to create their own profile after signup
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND policyname = 'users_insert_own_profile'
    ) THEN
        CREATE POLICY "users_insert_own_profile" 
        ON public.user_profiles 
        FOR INSERT 
        TO authenticated 
        WITH CHECK (id = auth.uid());
    END IF;
END $$;
```

**How to apply**:
1. Supabase Dashboard → **SQL Editor**
2. Paste the SQL above
3. Click **Run**
4. Verify success message

## 📧 Email Login Setup (Alternative to Phone)

### Option A: Use Your Real Email Addresses

**Recommended for testing** - Use email addresses you actually have access to:

1. **Admin Email**: Use your personal email (e.g., `your-email@gmail.com`)
2. **Tenant Email**: Use a different email or a secondary email

**Steps**:
1. Go to login page → **Email** tab
2. Enter email address
3. Click "Send Magic Link"
4. Check your email inbox (and spam folder)
5. Click the magic link
6. Complete profile with appropriate role

### Option B: Use Test Email Domains

You can use any email format, but you need access to receive the magic link:

- **Admin**: `admin@shantivaas.test` (or any email you control)
- **Tenant**: `tenant@shantivaas.test` (or any email you control)

**Important**: 
- You must have access to the email inbox to receive the magic link
- If using custom SMTP, ensure it's configured correctly
- If SMTP is broken, disable it to use Supabase default (limited to 3/hour)

## 📞 Step 1: Add Test Phone Numbers in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Phone**
2. Scroll to **Test Phone Numbers** section
3. Add the following test numbers:

   **Admin Test Number:**
   - Phone: `+919999999999`
   - OTP: `000000`
   - Click **Add**

   **Tenant Test Number:**
   - Phone: `+918888888888`
   - OTP: `000000`
   - Click **Add**

**Note**: You can use any phone numbers, but these are easy to remember. The format must include country code (e.g., `+91` for India).

## 👤 Step 2: Create Admin User

### Using Phone Login

1. **Go to Login Page**:
   - Visit `http://localhost:3000/login` (or `http://localhost:3001/login`)

2. **Switch to Phone Login**:
   - Click the **"Phone (OTP)"** tab

3. **Enter Admin Phone Number**:
   - Phone: `+919999999999` (must include `+91` prefix)
   - Click **"Send OTP"`

4. **Enter OTP**:
   - OTP: `000000` (the test OTP you configured)
   - Click **Verify**

5. **Complete Profile**:
   - You'll be redirected to `/auth/complete-profile`
   - Enter:
     - **Name**: `Admin User` (or any name)
     - **Role**: Select **"Admin"**
   - Click **Save**

6. **Success!**:
   - You'll be redirected to `/admin/dashboard`
   - You're now logged in as Admin ✅

### Using Email Login

1. **Go to Login Page**:
   - Visit `http://localhost:3000/login`

2. **Use Email Tab** (default):
   - Enter email: `admin@shantivaas.test` (or your real email)
   - Click **"Send Magic Link"**

3. **Check Email**:
   - Open your email inbox
   - Look for email from Supabase
   - Click the magic link (may be in spam folder)

4. **Complete Profile**:
   - You'll be redirected to `/auth/complete-profile`
   - Enter:
     - **Name**: `Admin User`
     - **Role**: Select **"Admin"**
   - Click **Save**

5. **Success!**:
   - You'll be redirected to `/admin/dashboard`
   - You're now logged in as Admin ✅

1. **Go to Login Page**:
   - Visit `http://localhost:3000/login` (or `http://localhost:3001/login`)

2. **Switch to Phone Login**:
   - Click the **"Phone (OTP)"** tab

3. **Enter Admin Phone Number**:
   - Phone: `+919999999999` (must include `+91` prefix)
   - Click **"Send OTP"**

4. **Enter OTP**:
   - OTP: `000000` (the test OTP you configured)
   - Click **Verify**

5. **Complete Profile**:
   - You'll be redirected to `/auth/complete-profile`
   - Enter:
     - **Name**: `Admin User` (or any name)
     - **Role**: Select **"Admin"**
   - Click **Save**

6. **Success!**:
   - You'll be redirected to `/admin/dashboard`
   - You're now logged in as Admin ✅

## 🏠 Step 3: Create Tenant User

### Using Phone Login

1. **Log Out**:
   - Click logout button (or go to `/auth/signout`)

2. **Go to Login Page Again**:
   - Visit `http://localhost:3000/login`

3. **Switch to Phone Login**:
   - Click the **"Phone (OTP)"** tab

4. **Enter Tenant Phone Number**:
   - Phone: `+918888888888` (must include `+91` prefix)
   - Click **"Send OTP"`

5. **Enter OTP**:
   - OTP: `000000`
   - Click **Verify**

6. **Complete Profile**:
   - You'll be redirected to `/auth/complete-profile`
   - Enter:
     - **Name**: `Tenant User` (or any name)
     - **Role**: Select **"Tenant"**
   - Click **Save**

7. **Success!**:
   - You'll be redirected to `/tenant/dashboard`
   - You're now logged in as Tenant ✅

### Using Email Login

1. **Log Out**:
   - Click logout button (or go to `/auth/signout`)

2. **Go to Login Page Again**:
   - Visit `http://localhost:3000/login`

3. **Use Email Tab**:
   - Enter email: `tenant@shantivaas.test` (or a different real email)
   - Click **"Send Magic Link"**

4. **Check Email**:
   - Open your email inbox
   - Look for email from Supabase
   - Click the magic link

5. **Complete Profile**:
   - You'll be redirected to `/auth/complete-profile`
   - Enter:
     - **Name**: `Tenant User`
     - **Role**: Select **"Tenant"**
   - Click **Save**

6. **Success!**:
   - You'll be redirected to `/tenant/dashboard`
   - You're now logged in as Tenant ✅

1. **Log Out**:
   - Click logout button (or go to `/auth/signout`)

2. **Go to Login Page Again**:
   - Visit `http://localhost:3000/login`

3. **Switch to Phone Login**:
   - Click the **"Phone (OTP)"** tab

4. **Enter Tenant Phone Number**:
   - Phone: `+918888888888` (must include `+91` prefix)
   - Click **"Send OTP"**

5. **Enter OTP**:
   - OTP: `000000`
   - Click **Verify**

6. **Complete Profile**:
   - You'll be redirected to `/auth/complete-profile`
   - Enter:
     - **Name**: `Tenant User` (or any name)
     - **Role**: Select **"Tenant"**
   - Click **Save**

7. **Success!**:
   - You'll be redirected to `/tenant/dashboard`
   - You're now logged in as Tenant ✅

## 📋 Test Credentials Summary

### Phone Login Credentials
| User Type | Phone Number | OTP | Role | Dashboard |
|-----------|--------------|-----|------|-----------|
| **Admin** | `+919999999999` | `000000` | Admin | `/admin/dashboard` |
| **Tenant** | `+918888888888` | `000000` | Tenant | `/tenant/dashboard` |

### Email Login Credentials
| User Type | Email | Role | Dashboard | Notes |
|-----------|-------|------|-----------|-------|
| **Admin** | `admin@shantivaas.test` | Admin | `/admin/dashboard` | Use any email you control |
| **Tenant** | `tenant@shantivaas.test` | Tenant | `/tenant/dashboard` | Use a different email you control |

**Email Login Tips**:
- **Use real email addresses** you have access to (you need to receive the magic link)
- **Recommended test emails**:
  - Admin: Your personal email (e.g., `your-email@gmail.com`)
  - Tenant: A different email or secondary email
- Check **spam folder** for magic links
- **Disable custom SMTP** if having issues (uses Supabase default)
- **Rate limit**: ~3 emails/hour on free tier
- **Important**: You must have access to the email inbox to click the magic link

## ⚠️ Important Notes

### Phone Number Format
- **Must include country code**: `+919999999999` ✅
- **Not**: `9999999999` ❌ (will fail)
- The UI placeholder shows the correct format: `+919876543210`

### Tenant Dashboard
- After creating a Tenant profile, the tenant dashboard may show "No Room Assigned"
- This is **normal** - the tenant needs to be assigned to a room by an Admin
- To assign a room:
  1. Log in as Admin
  2. Go to **Admin Dashboard** → **Tenants**
  3. Create a new tenant record and link to a room
  4. (This is a separate workflow - see Admin documentation)

### Profile Creation
- Each user can only create **one profile**
- The role (Admin/Tenant) is set during profile creation
- Role cannot be changed later (for security)

## 🔄 Switching Between Users

To switch between Admin and Tenant:

1. **Log out** from current account
2. **Log in** with the other phone number
3. You'll see the appropriate dashboard based on role

## 🐛 Troubleshooting

### "Failed to send OTP"
- Check Phone provider is enabled in Supabase
- Verify test phone number is added correctly
- Check phone number format includes country code

### "Error sending confirmation email" (Email Login)
- **Disable Custom SMTP** to use Supabase default email
- Check spam folder for magic links
- Verify email provider is enabled
- Wait if you hit rate limit (3 emails/hour)
- See `TROUBLESHOOTING.md` for detailed SMTP fix

### "Cannot create profile" or "Permission denied"
- **Run the SQL policy** (see Prerequisites above)
- Check Supabase logs for detailed error

### "Redirected to wrong dashboard"
- Verify role was selected correctly during profile creation
- Check `user_profiles` table in Supabase to confirm role

### Phone number not working
- Ensure format is correct: `+91XXXXXXXXXX`
- Check test phone number exists in Supabase Dashboard
- Try regenerating OTP in Supabase

## ✅ Verification Checklist

### Phone Login
- [ ] Phone provider enabled in Supabase
- [ ] Test phone numbers added in Supabase
- [ ] Admin user created via phone and can access `/admin/dashboard`
- [ ] Tenant user created via phone and can access `/tenant/dashboard`

### Email Login
- [ ] Email provider enabled in Supabase
- [ ] Custom SMTP disabled (or properly configured)
- [ ] Admin user created via email and can access `/admin/dashboard`
- [ ] Tenant user created via email and can access `/tenant/dashboard`

### Common
- [ ] SQL policy `users_insert_own_profile` created
- [ ] Both users can log out and log back in
- [ ] Can switch between Admin and Tenant accounts

## 🎯 Next Steps

After setting up test users:

1. **Test Admin Features**:
   - Create buildings, floors, rooms
   - Add tenants (link existing users to rooms)
   - View payments and reports

2. **Test Tenant Features**:
   - View assigned room (after Admin assigns one)
   - Make payments
   - Submit complaints

3. **Production Setup**:
   - Remove test phone numbers
   - Use real phone numbers
   - Configure proper SMS provider (Twilio, etc.)

---

**Status**: ✅ Phone login UI is ready and working. Just add test numbers in Supabase!

