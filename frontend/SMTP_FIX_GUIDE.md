# 🔧 SMTP Configuration Fix - Gmail Authentication Error

## ❌ Current Error

```
Error sending confirmation email
535 5.7.8 Username and Password not accepted
```

This error means your **Gmail SMTP credentials are incorrect** in Supabase.

## ✅ Solution: Use Gmail App Password

Gmail requires an **App Password** (not your regular password) for SMTP authentication.

### Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (required for App Passwords)
3. Follow the setup process

### Step 2: Generate App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Or: Google Account → Security → 2-Step Verification → App passwords
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Enter "Supabase"
4. Click **Generate**
5. **Copy the 16-character password** (you'll see it only once!)

### Step 3: Configure Supabase SMTP

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **Auth** → **SMTP Settings**
4. Configure as follows:

```
Enable Custom SMTP: ✅ ON

SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com (your full Gmail address)
SMTP Password: [Paste the 16-character App Password from Step 2]
Sender Email: your-email@gmail.com
Sender Name: Shantivaas (or your app name)
```

5. Click **Save**

### Step 4: Test SMTP Configuration

1. In Supabase Dashboard, go to **Settings** → **Auth** → **SMTP Settings**
2. Click **Send Test Email**
3. Enter your email address
4. Check if you receive the test email

## 🔄 Alternative: Use Supabase Default Email (No SMTP Setup)

If you don't want to configure custom SMTP:

1. In Supabase Dashboard → **Settings** → **Auth** → **SMTP Settings**
2. **Disable** "Enable Custom SMTP"
3. Supabase will use its default email service (limited on free tier)

**Note**: Default Supabase emails have rate limits and may go to spam.

## 📧 Other Email Providers

### Outlook/Hotmail
```
SMTP Host: smtp-mail.outlook.com
SMTP Port: 587
SMTP User: your-email@outlook.com
SMTP Password: [App Password from Microsoft Account]
```

### SendGrid (Recommended for Production)
1. Sign up at [SendGrid](https://sendgrid.com)
2. Create API Key
3. Use SendGrid SMTP settings in Supabase

### Mailgun
1. Sign up at [Mailgun](https://www.mailgun.com)
2. Verify domain
3. Use Mailgun SMTP settings

## ✅ Verification

After fixing SMTP:

1. **Restart your dev server** (if running)
2. Go to `http://localhost:3000/login`
3. Enter your email
4. Click "Send Magic Link"
5. Check your inbox (and spam folder)

## 🐛 Troubleshooting

### Still Getting "Username and Password not accepted"?

1. **Verify App Password**:
   - Make sure you copied the full 16-character password
   - No spaces or extra characters
   - Regenerate if unsure

2. **Check 2-Step Verification**:
   - Must be enabled to use App Passwords
   - Verify it's active in Google Account

3. **Verify Email Address**:
   - Use your **full Gmail address** (e.g., `user@gmail.com`)
   - Not just `user` or `user@`

4. **Check SMTP Port**:
   - Use **587** for TLS
   - Or **465** for SSL (if 587 doesn't work)

5. **Test Connection**:
   - Try sending test email from Supabase Dashboard
   - Check Supabase logs for detailed error

### Email Goes to Spam?

1. **Add SPF Record** (if using custom domain)
2. **Use Professional Email Service** (SendGrid, Mailgun)
3. **Verify Sender Email** in Supabase

## 📝 Quick Checklist

- [ ] 2-Step Verification enabled in Google Account
- [ ] App Password generated (16 characters)
- [ ] SMTP configured in Supabase with App Password
- [ ] Test email sent successfully
- [ ] Restart dev server
- [ ] Try login again

## 🎯 Status

✅ **Issue Identified**: Gmail SMTP authentication failure
✅ **Solution**: Use Gmail App Password instead of regular password
⚠️ **Action Required**: Generate App Password and update Supabase SMTP settings

