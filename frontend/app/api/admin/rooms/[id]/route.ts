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

        // Get room data using admin client (bypasses RLS)
        const supabaseAdmin = createAdminClient()
        const { data: room, error } = await supabaseAdmin
            .from('rooms')
            .select(`
                *,
                floors(
                    id,
                    floor_number,
                    building_id,
                    buildings(
                        id,
                        name
                    )
                )
            `)
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching room:', error)
            return NextResponse.json({ error: error.message || 'Room not found' }, { status: 404 })
        }

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 })
        }

        return NextResponse.json(room)
    } catch (error: any) {
        console.error('Get Room Error:', error)
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
            room_number, 
            floor_id, 
            capacity, 
            monthly_rent, 
            description,
            is_active
        } = body

        if (!room_number || !floor_id || !capacity || !monthly_rent) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 3. Update Room Record using admin client
        const supabaseAdmin = createAdminClient()
        const { error: updateError } = await supabaseAdmin
            .from('rooms')
            .update({
                room_number,
                floor_id,
                capacity: parseInt(capacity.toString()),
                monthly_rent: parseFloat(monthly_rent.toString()),
                description: description || null,
                is_active: is_active !== undefined ? is_active : true
            })
            .eq('id', id)

        if (updateError) {
            throw updateError
        }

        return NextResponse.json({ success: true, message: 'Room updated successfully' })

    } catch (error: any) {
        console.error('Update Room Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

