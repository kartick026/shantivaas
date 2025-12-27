import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
    try {
        const rawBody = await req.text()
        const signature = req.headers.get('x-razorpay-signature')

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
        }

        // Verify Webhook Signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(rawBody)
            .digest('hex')

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        const event = JSON.parse(rawBody)

        // Handle 'payment.captured'
        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity
            const notes = payment.notes // We passed rent_cycle_id and user_id in notes during order creation

            if (notes?.rent_cycle_id && notes?.user_id) {
                const supabase = await createClient()

                // Get Tenant ID
                const { data: tenant } = await supabase
                    .from('tenants')
                    .select('id')
                    .eq('user_id', notes.user_id)
                    .single()

                if (tenant) {
                    // Check if payment already exists (Idempotency)
                    const { data: existing } = await supabase
                        .from('payments')
                        .select('id')
                        .eq('razorpay_payment_id', payment.id)
                        .single()

                    if (!existing) {
                        // Insert Payment
                        await supabase.from('payments').insert({
                            tenant_id: tenant.id,
                            rent_cycle_id: notes.rent_cycle_id,
                            amount: payment.amount / 100, // Convert from paise
                            payment_date: new Date().toISOString().split('T')[0],
                            payment_mode: 'ONLINE_GATEWAY',
                            razorpay_payment_id: payment.id,
                            razorpay_order_id: payment.order_id,
                            is_verified: true,
                            notes: `Webhook: Order ${payment.order_id}`
                        })
                        console.log(`Webhook: Payment recorded for ${payment.id}`)
                    } else {
                        console.log(`Webhook: Payment ${payment.id} already exists`)
                    }
                }
            }
        }

        return NextResponse.json({ status: 'ok' })

    } catch (error: any) {
        console.error('Webhook Error:', error)
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}
