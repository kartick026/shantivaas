-- Migration: Add Tenant Documents Support

-- 1. Add columns to tenants table
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS address_proof_url TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT;

COMMENT ON COLUMN public.tenants.id_proof_url IS 'Aadhar Card URL';
COMMENT ON COLUMN public.tenants.address_proof_url IS 'Address Proof URL';
COMMENT ON COLUMN public.tenants.photo_url IS 'Tenant Photo URL';

-- 2. Create Storage Bucket (tenant-documents)
-- We insert into storage.buckets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-documents', 'tenant-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies
-- Enable RLS on objects if not already (it usually is)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can upload to tenant-documents
-- Uses the is_admin helper function to avoid recursion
CREATE POLICY "Admins can upload tenant docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tenant-documents'
  AND public.is_admin(auth.uid())
);

-- Policy: View access
CREATE POLICY "Anyone can view tenant docs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tenant-documents');

-- Policy: Update/Delete (Admins only)
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

CREATE POLICY "Admins can delete tenant docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'tenant-documents'
  AND public.is_admin(auth.uid())
);
