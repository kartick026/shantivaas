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
        // If rentCycleId is null, allocate to oldest pending cycles (multi-cycle payment)
        if (!rentCycleId) {
            const { createAdminClient } = await import('@/lib/supabase/admin')
            const supabaseAdmin = createAdminClient()
            
            // Get pending cycles
            const { data: pendingCycles, error: cyclesError } = await supabaseAdmin
                .rpc('get_pending_rent_cycles', { p_tenant_id: tenant.id })
            
            if (cyclesError || !pendingCycles || pendingCycles.length === 0) {
                return NextResponse.json({ 
                    error: 'No pending rent cycles found. Please contact admin.' 
                }, { status: 400 })
            }
            
            let remainingAmount = amount
            const paymentsCreated: string[] = []
            
            // Allocate payment across cycles (oldest first)
            for (const cycle of pendingCycles) {
                if (remainingAmount <= 0) break
                
                const pendingAmount = parseFloat(cycle.pending_amount?.toString() || '0')
                const cyclePayment = Math.min(remainingAmount, pendingAmount)
                
                if (cyclePayment > 0) {
                    const { error: paymentError } = await supabaseAdmin
                        .from('payments')
                        .insert({
                            tenant_id: tenant.id,
                            rent_cycle_id: cycle.id,
                            amount: cyclePayment,
                            payment_mode: 'ONLINE_GATEWAY',
                            razorpay_payment_id: razorpay_payment_id,
                            razorpay_order_id: razorpay_order_id,
                            razorpay_signature: razorpay_signature,
                            is_verified: true,
                            notes: `Online payment: Order ${razorpay_order_id} - Multi-cycle allocation`
                        })
                    
                    if (paymentError && paymentError.code !== '23505') {
                        console.error('Error creating payment for cycle:', cycle.id, paymentError)
                    } else {
                        paymentsCreated.push(cycle.id)
                        remainingAmount -= cyclePayment
                    }
                }
            }
            
            // Handle advance payment if remaining
            if (remainingAmount > 0) {
                const now = new Date()
                const nextMonth = now.getMonth() + 2
                const nextYear = nextMonth > 12 ? now.getFullYear() + 1 : now.getFullYear()
                const actualMonth = nextMonth > 12 ? 1 : nextMonth
                
                const { data: advanceCycleId, error: advanceError } = await supabaseAdmin
                    .rpc('get_or_create_rent_cycle', {
                        p_tenant_id: tenant.id,
                        p_month: actualMonth,
                        p_year: nextYear
                    })
                
                if (!advanceError && advanceCycleId) {
                    await supabaseAdmin
                        .from('payments')
                        .insert({
                            tenant_id: tenant.id,
                            rent_cycle_id: advanceCycleId,
                            amount: remainingAmount,
                            payment_mode: 'ONLINE_GATEWAY',
                            razorpay_payment_id: razorpay_payment_id,
                            razorpay_order_id: razorpay_order_id,
                            razorpay_signature: razorpay_signature,
                            is_verified: true,
                            notes: `Online payment: Order ${razorpay_order_id} - Advance payment`
                        })
                }
            }
            
            return NextResponse.json({ 
                success: true,
                message: `Payment allocated across ${paymentsCreated.length} cycle(s)`
            })
        }
        
        // Single cycle payment (can be partial)
        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                tenant_id: tenant.id,
                rent_cycle_id: rentCycleId,
                amount: amount,
                payment_date: new Date().toISOString().split('T')[0],
                payment_mode: 'ONLINE_GATEWAY',
                razorpay_payment_id: razorpay_payment_id,
                razorpay_order_id: razorpay_order_id,
                razorpay_signature: razorpay_signature,
                is_verified: true,
                notes: `Order: ${razorpay_order_id}`
            })

        if (paymentError) {
            // Check if it's a duplicate payment
            if (paymentError.code === '23505') {
                return NextResponse.json({ 
                    success: true,
                    message: 'Payment already recorded' 
                })
            }
            throw paymentError
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Payment Verification Error:', error)
        return NextResponse.json(
            { error: error.message || 'Verification failed' },
            { status: 500 }
        )
    }
}
