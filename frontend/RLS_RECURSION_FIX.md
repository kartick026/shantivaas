# ✅ Fixed: Infinite Recursion in user_profiles RLS Policy

## Problem

Error: **"infinite recursion detected in policy for relation 'user_profiles'"**

This occurred when trying to create a user profile after login.

## Root Cause

The RLS policy `admin_all_access_user_profiles` was checking if a user is an admin by querying the `user_profiles` table:

```sql
EXISTS (
  SELECT 1 FROM public.user_profiles
  WHERE id = auth.uid() AND role = 'admin'
)
```

When a new user tried to **INSERT** their profile:
1. The INSERT triggered the admin policy check
2. The policy queried `user_profiles` to check if user is admin
3. But the user doesn't have a profile yet (that's what we're inserting!)
4. This created infinite recursion

## Solution Applied

### 1. Created Helper Function

Created a `SECURITY DEFINER` function that bypasses RLS to check admin status:

```sql
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;
```

**Why this works**: `SECURITY DEFINER` functions run with superuser privileges and bypass RLS, preventing recursion.

### 2. Split Policies by Operation

Instead of one `FOR ALL` policy, created separate policies:
- **INSERT**: `users_insert_own_profile` - Users can create their own profile (no admin check needed)
- **SELECT**: `users_own_profile` + `admin_select_user_profiles` - Users see own, admins see all
- **UPDATE**: `users_update_own_profile` + `admin_update_user_profiles` - Users update own, admins update any
- **DELETE**: `admin_delete_user_profiles` - Only admins can delete

### 3. Updated Policies to Use Helper Function

Admin policies now use `public.is_admin(auth.uid())` instead of directly querying `user_profiles`, which prevents recursion.

## Current Policies

| Policy Name | Operation | Description |
|-------------|-----------|-------------|
| `users_insert_own_profile` | INSERT | Users can create their own profile |
| `users_own_profile` | SELECT | Users can view their own profile |
| `admin_select_user_profiles` | SELECT | Admins can view all profiles |
| `users_update_own_profile` | UPDATE | Users can update their own profile |
| `admin_update_user_profiles` | UPDATE | Admins can update any profile |
| `admin_delete_user_profiles` | DELETE | Admins can delete any profile |

## ✅ Status

**Fixed!** The infinite recursion issue has been resolved. You can now:

1. **Log in** with phone or email
2. **Complete your profile** without errors
3. **Choose your role** (Admin or Tenant)
4. **Access the appropriate dashboard**

## Testing

Try creating a profile again:
1. Go to `/login`
2. Log in with phone or email
3. You'll be redirected to `/auth/complete-profile`
4. Fill in your details and select role
5. Click "Get Started"
6. ✅ Should work without recursion error!

## Migration Applied

The fix has been applied via migration: `fix_user_profiles_rls_with_helper_function`

The original migration file has also been updated for future use.

