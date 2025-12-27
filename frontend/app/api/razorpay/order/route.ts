import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()

        // Auth check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { amount, rentCycleId } = await req.json()

        if (!amount) {
            return NextResponse.json({ error: 'Amount is required' }, { status: 400 })
        }
        
        // rentCycleId is optional (null for multi-cycle/advance payments)

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        })

        // Create Order
        // Amount must be in subunits (paise for INR)
        const receiptId = rentCycleId ? `rc_${rentCycleId}` : `multi_${Date.now()}`
        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: receiptId,
            notes: {
                rent_cycle_id: rentCycleId || null, // null for multi-cycle
                user_id: user.id
            }
        }

        const order = await razorpay.orders.create(options)

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        })

    } catch (error: any) {
        console.error('Razorpay Order Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create order' },
            { status: 500 }
        )
    }
}
