# 🔑 Quick Fix: Add Service Role Key

## Current Issue
The error shows: **"Missing Supabase admin credentials"** - This means `SUPABASE_SERVICE_ROLE_KEY` is not in your `.env.local` file.

## ✅ Quick Steps

### Step 1: Get Your Service Role Key

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **wensthowxnemnykgilsd**
3. Click **Settings** (gear icon) → **API**
4. Scroll to **Project API keys** section
5. Find the **`service_role`** key
6. Click **Reveal** or **Copy** (⚠️ Keep this secret - never commit to Git!)

### Step 2: Add to .env.local

Open `frontend/.env.local` and add this line:

```env
# Add this line (replace with your actual service role key)
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

Your `.env.local` should now look like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wensthowxnemnykgilsd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkP...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbnN0aG93eG5lbW55a2dpbHNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njg1MzU5NSwiZXhwIjoyMDgyNDI5NTk1fQ...
```

### Step 3: Restart Dev Server

After saving `.env.local`:

1. **Stop** the current dev server (press `Ctrl+C` in terminal)
2. **Start** it again:
   ```bash
   npm run dev
   ```

### Step 4: Refresh Browser

1. Go back to your browser
2. Refresh the page (`F5` or `Ctrl+R`)
3. The error should be gone! ✅

## ⚠️ Security Reminder

- ✅ **DO** add to `.env.local` (local development only)
- ❌ **DON'T** commit to Git (should be in `.gitignore`)
- ❌ **DON'T** share publicly
- ❌ **DON'T** use in client-side code

The service role key bypasses Row Level Security (RLS) - it's only for server-side admin operations.

## 🔍 Verify It Works

After adding the key and restarting:

1. Go to `/admin/tenants/new`
2. The red error message should disappear ✅
3. You should be able to see the full form without errors

---

**Location**: `frontend/.env.local`
**Project**: wensthowxnemnykgilsd

