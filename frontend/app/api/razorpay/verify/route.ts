import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()

        // Auth check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            rentCycleId,
            amount
        } = await req.json()

        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex')

        const isAuthentic = expectedSignature === razorpay_signature

        if (!isAuthentic) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        // 2. Get Tenant ID for this user
        const { data: tenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!tenant) {
            throw new Error('Tenant record not found')
        }

        // 3. Record Payment in Database
        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                tenant_id: tenant.id,
                rent_cycle_id: rentCycleId,
                amount: amount,
                payment_date: new Date().toISOString().split('T')[0],
                payment_mode: 'ONLINE_GATEWAY',
                gateway_transaction_id: razorpay_payment_id,
                is_verified: true, // Auto-verified since signature matched
                notes: `Order: ${razorpay_order_id}`
            })

        if (paymentError) throw paymentError

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Payment Verification Error:', error)
        return NextResponse.json(
            { error: error.message || 'Verification failed' },
            { status: 500 }
        )
    }
}
