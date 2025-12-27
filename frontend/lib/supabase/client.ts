import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.\n' +
      'Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  // Check if using placeholder values
  if (supabaseUrl.includes('your-project-ref') || supabaseAnonKey.includes('your-anon-key')) {
    throw new Error(
      'Supabase credentials are not configured. Please update your .env.local file with real values from your Supabase project dashboard.'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
