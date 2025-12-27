import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount)
}

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
        const { 
            tenant_id, 
            rent_cycle_id, 
            amount, 
            payment_mode, 
            payment_date, 
            notes 
        } = body

        if (!tenant_id || !amount || !payment_mode) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabaseAdmin = createAdminClient()
        const paymentAmount = parseFloat(amount)

        // 3. Handle payment allocation
        // If rent_cycle_id is provided, pay for that cycle
        // If not, allocate payment across pending cycles (oldest first)
        let remainingAmount = paymentAmount
        const paymentsCreated: string[] = []

        if (rent_cycle_id) {
            // Single cycle payment (can be partial)
            const { error: paymentError } = await supabaseAdmin
                .from('payments')
                .insert({
                    tenant_id,
                    rent_cycle_id,
                    amount: paymentAmount,
                    payment_mode,
                    payment_date: payment_date || new Date().toISOString(),
                    notes,
                    received_by: user.id,
                    is_verified: true,
                    verified_at: new Date().toISOString(),
                    verified_by: user.id
                })

            if (paymentError) {
                throw paymentError
            }
        } else {
            // Multi-cycle payment: allocate to oldest overdue cycles first
            const { data: pendingCycles, error: cyclesError } = await supabaseAdmin
                .rpc('get_pending_rent_cycles', { p_tenant_id: tenant_id })

            if (cyclesError) {
                console.error('Error getting pending cycles:', cyclesError)
                // If function doesn't exist, get cycles directly
                const { data: cycles } = await supabaseAdmin
                    .from('rent_cycles')
                    .select('*')
                    .eq('tenant_id', tenant_id)
                    .in('status', ['pending', 'overdue'])
                    .order('due_date', { ascending: true })

                if (!cycles || cycles.length === 0) {
                    return NextResponse.json({ 
                        error: 'No pending rent cycles found for this tenant' 
                    }, { status: 400 })
                }

                // Allocate payment across cycles
                for (const cycle of cycles) {
                    if (remainingAmount <= 0) break

                    // Get pending amount for this cycle
                    const { data: pendingData, error: pendingError } = await supabaseAdmin
                        .rpc('get_rent_cycle_pending', { p_rent_cycle_id: cycle.id })

                    const pendingAmount = (!pendingError && pendingData !== null) 
                        ? parseFloat(pendingData.toString()) 
                        : (cycle.amount_due + (cycle.late_fee_amount || 0))

                    // Calculate payment for this cycle
                    const cyclePayment = Math.min(remainingAmount, pendingAmount)

                    if (cyclePayment > 0) {
                        const { error: paymentError } = await supabaseAdmin
                            .from('payments')
                            .insert({
                                tenant_id,
                                rent_cycle_id: cycle.id,
                                amount: cyclePayment,
                                payment_mode,
                                payment_date: payment_date || new Date().toISOString(),
                                notes: notes || `Multi-cycle payment: ${cyclePayment} for ${cycle.due_month}/${cycle.due_year}`,
                                received_by: user.id,
                                is_verified: true,
                                verified_at: new Date().toISOString(),
                                verified_by: user.id
                            })

                        if (paymentError) {
                            throw paymentError
                        }

                        paymentsCreated.push(cycle.id)
                        remainingAmount -= cyclePayment
                    }
                }
            } else if (pendingCycles && pendingCycles.length > 0) {
                // Allocate payment across cycles using function results
                for (const cycle of pendingCycles) {
                    if (remainingAmount <= 0) break

                    const pendingAmount = parseFloat(cycle.pending_amount?.toString() || '0')
                    const cyclePayment = Math.min(remainingAmount, pendingAmount)

                    if (cyclePayment > 0) {
                        const { error: paymentError } = await supabaseAdmin
                            .from('payments')
                            .insert({
                                tenant_id,
                                rent_cycle_id: cycle.id,
                                amount: cyclePayment,
                                payment_mode,
                                payment_date: payment_date || new Date().toISOString(),
                                notes: notes || `Multi-cycle payment: ${formatCurrency(cyclePayment)} for ${cycle.due_month}/${cycle.due_year}`,
                                received_by: user.id,
                                is_verified: true,
                                verified_at: new Date().toISOString(),
                                verified_by: user.id
                            })

                        if (paymentError) {
                            throw paymentError
                        }

                        paymentsCreated.push(cycle.id)
                        remainingAmount -= cyclePayment
                    }
                }
            } else {
                // No pending cycles - treat as advance payment only
            }

            // If there's remaining amount, it's an advance payment
            if (remainingAmount > 0) {
                // Get current month/year for advance payment
                const now = new Date()
                const nextMonth = now.getMonth() + 2 // Current month + 1
                const nextYear = nextMonth > 12 ? now.getFullYear() + 1 : now.getFullYear()
                const actualMonth = nextMonth > 12 ? 1 : nextMonth

                // Create or get next month's rent cycle
                const { data: advanceCycleId, error: advanceError } = await supabaseAdmin
                    .rpc('get_or_create_rent_cycle', {
                        p_tenant_id: tenant_id,
                        p_month: actualMonth,
                        p_year: nextYear
                    })

                if (!advanceError && advanceCycleId) {
                    const { error: advancePaymentError } = await supabaseAdmin
                        .from('payments')
                        .insert({
                            tenant_id,
                            rent_cycle_id: advanceCycleId,
                            amount: remainingAmount,
                            payment_mode,
                            payment_date: payment_date || new Date().toISOString(),
                            notes: notes ? `${notes} (Advance payment)` : `Advance payment for ${actualMonth}/${nextYear}`,
                            received_by: user.id,
                            is_verified: true,
                            verified_at: new Date().toISOString(),
                            verified_by: user.id
                        })

                    if (advancePaymentError) {
                        console.warn('Advance payment failed:', advancePaymentError)
                    } else {
                        paymentsCreated.push(advanceCycleId)
                    }
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Payment recorded successfully',
            paymentsCreated: paymentsCreated.length
        })

    } catch (error: any) {
        console.error('Mark Payment Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

