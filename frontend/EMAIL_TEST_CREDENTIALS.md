# 📧 Email Test Credentials - Quick Reference

## Test Email Addresses

For testing Admin and Tenant login with email:

| User Type | Email | Role | Dashboard |
|-----------|-------|------|-----------|
| **Admin** | `admin@shantivaas.test` | Admin | `/admin/dashboard` |
| **Tenant** | `tenant@shantivaas.test` | Tenant | `/tenant/dashboard` |

**⚠️ Important**: These are example emails. You must use **real email addresses** that you have access to, because you need to receive and click the magic link!

## Recommended Setup

### Option 1: Use Your Real Emails (Easiest)

1. **Admin Email**: Use your personal email
   - Example: `your-email@gmail.com`
   - You'll receive magic link here

2. **Tenant Email**: Use a different email
   - Example: `your-other-email@gmail.com` or `your-email+tenant@gmail.com` (Gmail supports + aliases)
   - You'll receive magic link here

### Option 2: Use Email Aliases

If using Gmail, you can use the same inbox with aliases:
- Admin: `your-email+admin@gmail.com`
- Tenant: `your-email+tenant@gmail.com`

Both emails go to the same inbox, but Supabase treats them as different users.

## Setup Steps

1. **Disable Custom SMTP** (for testing):
   - Supabase Dashboard → **Settings** → **Auth** → **SMTP Settings**
   - Turn OFF "Enable Custom SMTP"
   - This uses Supabase default email (limited to 3/hour)

2. **Login as Admin**:
   - Go to `/login`
   - Enter admin email
   - Click "Send Magic Link"
   - Check email (and spam folder)
   - Click magic link
   - Complete profile → Select "Admin"

3. **Login as Tenant**:
   - Log out
   - Go to `/login`
   - Enter tenant email
   - Click "Send Magic Link"
   - Check email
   - Click magic link
   - Complete profile → Select "Tenant"

## Troubleshooting

### Magic Link Not Received
- Check spam/junk folder
- Wait a few minutes (email delivery can be delayed)
- Verify email provider is enabled in Supabase
- Check rate limit (3 emails/hour on free tier)

### "Error sending confirmation email"
- Disable custom SMTP (use Supabase default)
- Or fix SMTP configuration (see `SMTP_FIX_GUIDE.md`)

### Email Goes to Spam
- Normal for Supabase default email
- For production, configure custom SMTP with proper SPF/DKIM

## Quick Test

1. Use your real email for Admin
2. Use a different email (or +alias) for Tenant
3. Both will work with Supabase default email service

See `TEST_USERS_SETUP.md` for complete instructions.

