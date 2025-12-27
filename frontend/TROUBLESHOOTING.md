# 🔧 Troubleshooting Guide - Shantivaas

## Email Authentication Issues

### Error: "Error sending confirmation email" or AuthRetryableFetchError

This error typically means one of:
1. **SMTP Configuration Issue** - Gmail/email provider credentials are wrong
2. **Network/Connection Issue** - Cannot reach Supabase
3. **Rate Limiting** - Too many email requests

## ✅ Quick Fixes

### Option 1: Use Phone Login (Recommended for Testing)

**Bypass email entirely** by using phone OTP:

1. **Enable Phone Provider in Supabase**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Navigate to **Authentication** → **Providers**
   - Enable **Phone** provider
   - Save

2. **Add Test Phone Number** (for development):
   - In Supabase Dashboard → **Authentication** → **Phone**
   - Scroll to **Test Phone Numbers**
   - Add: `+1234567890` with OTP: `123456`
   - Or use your real phone number

3. **Use Phone Login**:
   - Go to `http://localhost:3000/login`
   - Click **Phone (OTP)** tab
   - Enter phone number (with country code, e.g., `+919876543210`)
   - Click "Send OTP"
   - Enter the OTP code
   - You're logged in! ✅

### Option 2: Disable Custom SMTP (Use Supabase Default)

If you want to use email but SMTP is broken:

1. **Disable Custom SMTP**:
   - Supabase Dashboard → **Settings** → **Auth** → **SMTP Settings**
   - **Disable** "Enable Custom SMTP"
   - Save

2. **Note**: Supabase default email has:
   - Rate limit: ~3 emails/hour on free tier
   - May go to spam folder
   - Less reliable than custom SMTP

3. **Try login again** with email

### Option 3: Fix Gmail SMTP (For Production)

If you need custom SMTP working:

1. **Enable 2-Step Verification** in Google Account
2. **Generate App Password**:
   - [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" → "Other" → "Supabase"
   - Copy the 16-character password

3. **Configure Supabase SMTP**:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: your-email@gmail.com (FULL email)
   SMTP Password: [16-character App Password]
   Sender Email: your-email@gmail.com (MUST match SMTP User)
   ```

4. **Important**: Sender Email must match SMTP User exactly!

5. **Test**: Click "Send Test Email" in Supabase

## 🔍 Debugging Steps

### Check Browser Console

1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for detailed error messages
4. Check **Network** tab to see if request is being made

### Verify Environment Variables

```bash
# In frontend directory
cat .env.local
```

Should show:
```
NEXT_PUBLIC_SUPABASE_URL=https://wensthowxnemnykgilsd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Check Supabase Project Status

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Verify project is **not paused**
3. Check **Settings** → **API** for correct URL

### Test Supabase Connection

Visit: `http://localhost:3000/debug` (if available)
- Should show connection status
- Displays environment variables (masked)

## 📝 Required SQL Policy

After first login, you need to create a user profile. Run this SQL in Supabase:

```sql
-- Allow users to create their own profile after signup
CREATE POLICY "users_insert_own_profile" 
ON public.user_profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (id = auth.uid());
```

**How to apply**:
1. Supabase Dashboard → **SQL Editor**
2. Paste the SQL above
3. Click **Run**
4. Try login again

## 🚀 Recommended Development Workflow

1. **Use Phone Login** for quick testing
2. **Fix SMTP** when ready for production
3. **Test with real email** before deploying

## 📞 Still Stuck?

1. **Check Supabase Logs**:
   - Dashboard → **Logs** → **Auth**
   - Look for detailed error messages

2. **Verify Email Provider**:
   - Gmail: Use App Password
   - Outlook: Use App Password
   - Other: Check provider's SMTP docs

3. **Try Different Email**:
   - Some email providers block automated emails
   - Try a different email address

4. **Check Rate Limits**:
   - Supabase free tier: ~3 emails/hour
   - Wait 1 hour if you hit the limit

## ✅ Success Checklist

- [ ] Phone login works (for testing)
- [ ] SMTP configured correctly (for production)
- [ ] Test email received from Supabase
- [ ] User profile policy created
- [ ] Can log in successfully

