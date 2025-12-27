
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        // 1. Check if current user is admin
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 2. Parse Request Body
        const body = await request.json()
        const { email, phone, full_name, room_id, individual_rent, join_date, emergency_contact, password, id_proof_url, address_proof_url, photo_url } = body

        // 3. Check if user already exists (by email or phone)
        const supabaseAdmin = createAdminClient()
        
        // Check if email/phone already exists in user_profiles first (faster check)
        const { data: existingProfile } = await supabaseAdmin
            .from('user_profiles')
            .select('id, role, full_name, email, phone')
            .or(`email.eq.${email}${phone ? ',phone.eq.' + phone : ''}`)
            .maybeSingle()

        const emailExists = !!existingProfile

        if (emailExists && existingProfile) {
            // Check if tenant record exists
            const { data: existingTenant } = await supabaseAdmin
                .from('tenants')
                .select('id')
                .eq('user_id', existingProfile.id)
                .maybeSingle()

            if (existingTenant) {
                return NextResponse.json({ 
                    error: `Tenant "${existingProfile.full_name}" already exists with email ${email || existingProfile.email}. Please use a different email or update the existing tenant.` 
                }, { status: 400 })
            } else {
                // User exists but no tenant record - create tenant record for existing user
                const tenantData: any = {
                    user_id: existingProfile.id,
                    room_id: room_id || null,
                    individual_rent: parseFloat(individual_rent) || 1000, // Default minimum rent
                    join_date: join_date || new Date().toISOString().split('T')[0],
                    emergency_contact: emergency_contact || null,
                    is_active: true
                }

                if (id_proof_url) tenantData.id_proof_url = id_proof_url
                if (address_proof_url) tenantData.address_proof_url = address_proof_url
                if (photo_url) tenantData.photo_url = photo_url

                const { error: tenantError } = await supabaseAdmin
                    .from('tenants')
                    .insert(tenantData)

                if (tenantError) {
                    throw tenantError
                }

                return NextResponse.json({ 
                    success: true, 
                    userId: existingProfile.id,
                    message: `Tenant record created for existing user: ${existingProfile.full_name}`
                })
            }
        }

        // 4. Create Auth User using Admin Client (user doesn't exist)
        // Use a default password if not provided
        const userPassword = password || 'Tenant@123'

        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            phone,
            password: userPassword,
            email_confirm: true,
            user_metadata: { full_name }
        })

        if (authError) {
            // Better error handling for duplicate user
            if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
                return NextResponse.json({ 
                    error: `A user with email ${email}${phone ? ` or phone ${phone}` : ''} already exists. Please use a different email or link the existing user to a tenant.` 
                }, { status: 400 })
            }
            throw authError
        }
        if (!authUser.user) throw new Error('Failed to create auth user')

        // 5. Create User Profile
        const { error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .insert({
                id: authUser.user.id,
                role: 'tenant',
                full_name,
                email,
                phone
            })

        if (profileError) {
            // Rollback auth user if profile creation fails (cleanup)
            await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
            throw profileError
        }

        // 6. Create Tenant Record
        const tenantData: any = {
            user_id: authUser.user.id,
            room_id: room_id || null,
            individual_rent: parseFloat(individual_rent),
            join_date,
            emergency_contact: emergency_contact || null,
            is_active: true
        }

        // Add document URLs if provided
        if (id_proof_url) tenantData.id_proof_url = id_proof_url
        if (address_proof_url) tenantData.address_proof_url = address_proof_url
        if (photo_url) tenantData.photo_url = photo_url

        const { error: tenantError } = await supabaseAdmin
            .from('tenants')
            .insert(tenantData)

        if (tenantError) {
            // We can't easily rollback profile/auth here without transactions, but usually this step is safe if validation passed.
            // Ideally we'd delete the profile and user but let's just throw for now.
            throw tenantError
        }

        return NextResponse.json({ success: true, userId: authUser.user.id })

    } catch (error: any) {
        console.error('Create Tenant Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
