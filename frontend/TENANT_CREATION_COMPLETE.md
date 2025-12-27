# ✅ Tenant Creation Backend - Complete Setup Guide

## Overview

The backend for tenant creation with file uploads has been set up. Follow these steps to complete the configuration.

## ✅ Completed

1. ✅ Added `address_proof_url` and `photo_url` columns to `tenants` table
2. ✅ Updated API route to handle tenant creation with documents
3. ✅ Enhanced admin client with proper error handling
4. ✅ Created helper documentation

## 🔧 Setup Required

### Step 1: Add Service Role Key

**The error "supabaseKey is required" means you need to add the Service Role Key.**

1. Get your Service Role Key:
   - Go to [Supabase Dashboard](https://app.supabase.com) → Your Project
   - Navigate to **Settings** → **API**
   - Copy the **`service_role`** key (⚠️ Keep secret!)

2. Add to `frontend/.env.local`:
   ```env
   # Add this line
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. Restart your dev server:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

**See**: `SETUP_SERVICE_ROLE_KEY.md` for detailed instructions

### Step 2: Create Storage Bucket

The `tenant-documents` storage bucket needs to be created manually:

1. Go to [Supabase Dashboard](https://app.supabase.com) → Your Project
2. Navigate to **Storage** (left sidebar)
3. Click **"New bucket"**
4. Configure:
   - **Name**: `tenant-documents`
   - **Public bucket**: ✅ Enable (check this)
   - Click **"Create bucket"**

**See**: `SETUP_STORAGE_BUCKET.md` for detailed instructions and policies

### Step 3: Apply Storage Policies

After creating the bucket, apply the storage policies using the SQL from the migration:

1. Go to **SQL Editor** in Supabase Dashboard
2. Run the policies from `supabase/migrations/20250101000022_tenant_docs.sql`

Or use the policies provided in `SETUP_STORAGE_BUCKET.md`.

## 🎯 How It Works

### File Upload Flow

1. **User selects file** (Photo, Aadhar, Address Proof)
2. **File uploads to Supabase Storage** (`tenant-documents` bucket)
3. **Public URL is saved** to form state
4. **On submit**, URLs are sent to API route

### Tenant Creation Flow

1. **API Route** (`/api/admin/create-tenant`) receives form data
2. **Validates admin access** (checks current user is admin)
3. **Creates Auth User** (using service role key - bypasses normal auth)
4. **Creates User Profile** (in `user_profiles` table)
5. **Creates Tenant Record** (in `tenants` table with document URLs)

## 📋 Form Fields Mapped

| Form Field | Database Column | Table |
|------------|----------------|-------|
| Full Name | `full_name` | `user_profiles` |
| Email | `email` | `user_profiles`, `auth.users` |
| Phone | `phone` | `user_profiles`, `auth.users` |
| Emergency Contact | `emergency_contact` | `tenants` |
| Room | `room_id` | `tenants` |
| Monthly Rent | `individual_rent` | `tenants` |
| Join Date | `join_date` | `tenants` |
| Tenant Photo | `photo_url` | `tenants` |
| Aadhar Card | `id_proof_url` | `tenants` |
| Address Proof | `address_proof_url` | `tenants` |
| Password | N/A | `auth.users` (default: `Tenant@123`) |

## 🔒 Security

- ✅ Admin-only access (checked via `is_admin()` function)
- ✅ Service role key only used server-side (never exposed to client)
- ✅ RLS policies enforce admin-only operations
- ✅ Storage policies restrict uploads to admins
- ✅ File size limits and MIME type restrictions

## 🐛 Troubleshooting

### "supabaseKey is required"
- ✅ Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- ✅ Restart dev server

### "Bucket does not exist"
- ✅ Create `tenant-documents` bucket in Supabase Dashboard
- ✅ Make it public

### "Permission denied" on file upload
- ✅ Verify storage policies are applied
- ✅ Check `is_admin()` function exists (from RLS fix)
- ✅ Ensure user is logged in as admin

### "Failed to create tenant"
- ✅ Check browser console for specific error
- ✅ Verify all required fields are filled
- ✅ Check Supabase logs for detailed error

## ✅ Testing

After completing setup:

1. Go to `/admin/tenants/new`
2. Fill in all form fields
3. Upload files (Photo, Aadhar, Address Proof)
4. Click "Create Tenant Account"
5. Should redirect to `/admin/tenants` ✅

## 📚 Related Files

- `frontend/app/api/admin/create-tenant/route.ts` - API route
- `frontend/app/admin/tenants/new/page.tsx` - Form component
- `frontend/lib/supabase/admin.ts` - Admin client
- `supabase/migrations/20250101000022_tenant_docs.sql` - Storage migration

---

**Status**: Backend is ready! Complete the setup steps above to enable tenant creation with file uploads.

