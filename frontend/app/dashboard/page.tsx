import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile to determine role
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile) {
        // Profile not found, redirect to create profile or logout
        redirect('/auth/complete-profile')
    }

    // Redirect based on role
    if (profile.role === 'admin') {
        redirect('/admin/dashboard')
    } else {
        redirect('/tenant/dashboard')
    }
}
