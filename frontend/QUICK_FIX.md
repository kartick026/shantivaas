# ⚡ Quick Fix - Email Login Error

## Current Error
`AuthRetryableFetchError` or "Error sending confirmation email"

## 🚀 Fastest Solution: Use Phone Login

**Skip email entirely** - this works immediately:

1. **Enable Phone in Supabase**:
   - Dashboard → **Authentication** → **Providers** → Enable **Phone**

2. **On Login Page**:
   - Click **"Phone (OTP)"** tab
   - Enter phone: `+919876543210` (with country code)
   - Click "Send OTP"
   - Enter the code you receive
   - ✅ You're logged in!

## 🔧 Alternative: Fix Email

### Quick Fix - Disable Custom SMTP

1. Supabase Dashboard → **Settings** → **Auth** → **SMTP Settings**
2. **Turn OFF** "Enable Custom SMTP"
3. Save
4. Try email login again

**Note**: Limited to ~3 emails/hour on free tier

### Proper Fix - Gmail App Password

1. [Enable 2-Step Verification](https://myaccount.google.com/security)
2. [Generate App Password](https://myaccount.google.com/apppasswords)
   - Select "Mail" → "Other" → "Supabase"
   - Copy 16-character password
3. Supabase → **Settings** → **Auth** → **SMTP Settings**:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: your-email@gmail.com
   SMTP Password: [16-char App Password]
   Sender Email: your-email@gmail.com (MUST match User)
   ```
4. Save & Test

## ✅ Policy Created

The required SQL policy has been automatically created. You can now log in!

## 📝 Next Steps

1. **Try Phone Login** (fastest)
2. **Or fix SMTP** (for production)
3. **Create your admin profile** after first login

See `TROUBLESHOOTING.md` for detailed help.

