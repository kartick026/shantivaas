# 🔑 Setup Supabase Service Role Key

## Error: "supabaseKey is required"

This error occurs when the **Service Role Key** is missing from your environment variables.

## Solution

### Step 1: Get Your Service Role Key

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Scroll to **Project API keys**
5. Copy the **`service_role`** key (⚠️ Keep this secret!)

### Step 2: Add to Environment Variables

Add the service role key to `frontend/.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Admin Operations (Server-side only - NEVER expose to client!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 3: Restart Development Server

After adding the key, restart your Next.js dev server:

1. Stop the current server (Ctrl+C)
2. Run: `npm run dev`

## ⚠️ Security Notes

- **Never commit** the Service Role Key to Git
- **Never expose** it to client-side code
- Add `.env.local` to `.gitignore` (should already be there)
- The Service Role Key bypasses Row Level Security (RLS) - use only in server-side API routes

## What It's Used For

The Service Role Key is required for admin operations like:
- Creating user accounts (tenant creation)
- Bypassing RLS for administrative tasks
- Server-side operations that need elevated privileges

## Verify Setup

After adding the key, try creating a tenant again. The error should be resolved.

---

**Location of `.env.local`**: `frontend/.env.local`

