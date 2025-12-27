# 📦 Setup Storage Bucket for Tenant Documents

## Manual Setup Required

Storage buckets must be created through the Supabase Dashboard. Here's how:

### Step 1: Create Storage Bucket

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Storage** (left sidebar)
4. Click **"New bucket"**
5. Configure:
   - **Name**: `tenant-documents`
   - **Public bucket**: ✅ **Enable** (check this box)
   - Click **"Create bucket"**

### Step 2: Configure Bucket Settings (Optional)

After creating, click on the `tenant-documents` bucket to configure:

1. **File size limit**: 50 MB (or your preference)
2. **Allowed MIME types**: 
   - `image/jpeg`
   - `image/png`
   - `image/jpg`
   - `image/webp`
   - `application/pdf`

### Step 3: Set Up Storage Policies

Go to **Storage** → **Policies** → Select `tenant-documents` bucket.

**Add these policies:**

#### Policy 1: Admins can upload
```sql
CREATE POLICY "Admins can upload tenant docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tenant-documents'
  AND public.is_admin(auth.uid())
);
```

#### Policy 2: Authenticated users can view
```sql
CREATE POLICY "Authenticated users can view tenant docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'tenant-documents');
```

#### Policy 3: Public can view (since bucket is public)
```sql
CREATE POLICY "Public can view tenant docs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tenant-documents');
```

#### Policy 4: Admins can update
```sql
CREATE POLICY "Admins can update tenant docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'tenant-documents'
  AND public.is_admin(auth.uid())
)
WITH CHECK (
  bucket_id = 'tenant-documents'
  AND public.is_admin(auth.uid())
);
```

#### Policy 5: Admins can delete
```sql
CREATE POLICY "Admins can delete tenant docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'tenant-documents'
  AND public.is_admin(auth.uid())
);
```

### Alternative: Use SQL Editor

You can also run these in the **SQL Editor**:

1. Go to **SQL Editor** in Supabase Dashboard
2. Paste the policy SQL statements above
3. Click **Run**

## ✅ Verification

After setup, test by:
1. Going to `/admin/tenants/new`
2. Try uploading a file (Photo, Aadhar, or Address Proof)
3. File should upload successfully ✅

## Troubleshooting

### "Bucket does not exist"
- Make sure you created the bucket named exactly `tenant-documents`
- Check that it's public

### "Permission denied"
- Verify the storage policies are created
- Check that `public.is_admin()` function exists (from RLS fix migration)

### "File upload fails"
- Check file size (should be < 50MB)
- Verify file type is allowed (images or PDF)
- Check browser console for specific error

---

**Note**: Storage buckets require dashboard access to create. The migration will handle the table columns, but buckets must be created manually.

