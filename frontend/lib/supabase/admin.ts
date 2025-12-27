import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error(
            'Missing Supabase admin credentials. Please check your .env.local file.\n' +
            'Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY\n' +
            'Get your Service Role Key from: Supabase Dashboard → Settings → API → service_role key'
        )
    }

    // Check if using placeholder values
    if (supabaseUrl.includes('your-project-ref') || supabaseServiceRoleKey.includes('your-service-role-key')) {
        throw new Error(
            'Supabase admin credentials are not configured. Please update your .env.local file with real values from your Supabase project dashboard.'
        )
    }

    return createClient(
        supabaseUrl,
        supabaseServiceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
