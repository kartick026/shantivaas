import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify admin
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Get tenant data using admin client (bypasses RLS)
        const supabaseAdmin = createAdminClient()
        const { data: tenant, error } = await supabaseAdmin
            .from('tenants')
            .select(`
                *,
                user_profiles(full_name, email, phone),
                rooms(
                    id, 
                    room_number,
                    floors(
                        floor_number,
                        buildings(name)
                    )
                )
            `)
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching tenant:', error)
            return NextResponse.json({ error: error.message || 'Tenant not found' }, { status: 404 })
        }

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
        }

        return NextResponse.json(tenant)
    } catch (error: any) {
        console.error('Get Tenant Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
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
        const { 
            email, 
            phone, 
            full_name, 
            room_id, 
            individual_rent, 
            join_date, 
            leave_date,
            emergency_contact, 
            id_proof_url, 
            address_proof_url, 
            photo_url,
            is_active
        } = body

        // 3. Get existing tenant to find user_id
        const supabaseAdmin = createAdminClient()
        const { data: existingTenant, error: fetchError } = await supabaseAdmin
            .from('tenants')
            .select('user_id')
            .eq('id', id)
            .single()

        if (fetchError || !existingTenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
        }

        const userId = existingTenant.user_id

        // 4. Update User Profile
        const { error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .update({
                full_name,
                email,
                phone
            })
            .eq('id', userId)

        if (profileError) {
            throw profileError
        }

        // 5. Update Auth User (email and phone)
        const updateAuthData: any = {}
        if (email) updateAuthData.email = email
        if (phone) updateAuthData.phone = phone

        if (Object.keys(updateAuthData).length > 0) {
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                updateAuthData
            )

            if (authError) {
                console.warn('Auth update warning:', authError)
                // Don't fail if auth update fails, continue with tenant update
            }
        }

        // 6. Update Tenant Record
        const tenantData: any = {
            room_id: room_id || null,
            individual_rent: parseFloat(individual_rent),
            join_date,
            leave_date: leave_date || null,
            emergency_contact: emergency_contact || null,
            is_active: is_active !== undefined ? is_active : true
        }

        // Update document URLs if provided (null means remove, empty string means no change)
        if (id_proof_url !== undefined) tenantData.id_proof_url = id_proof_url || null
        if (address_proof_url !== undefined) tenantData.address_proof_url = address_proof_url || null
        if (photo_url !== undefined) tenantData.photo_url = photo_url || null

        const { error: tenantError } = await supabaseAdmin
            .from('tenants')
            .update(tenantData)
            .eq('id', id)

        if (tenantError) {
            throw tenantError
        }

        return NextResponse.json({ success: true, message: 'Tenant updated successfully' })

    } catch (error: any) {
        console.error('Update Tenant Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

