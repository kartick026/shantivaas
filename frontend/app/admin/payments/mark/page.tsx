'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, IndianRupee, Calendar, CreditCard, Wallet, Banknote, CheckCircle2, Info, Loader2 } from 'lucide-react'

export default function MarkPaymentPage() {
    const [formData, setFormData] = useState({
        tenant_id: '',
        rent_cycle_id: '',
        amount: '',
        payment_mode: 'CASH' as 'CASH' | 'BANK_TRANSFER' | 'UPI_MANUAL',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
    })
    const [tenants, setTenants] = useState<any[]>([])
    const [rentCycles, setRentCycles] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    // Load tenants
    useEffect(() => {
        async function loadTenants() {
            const { data } = await supabase
                .from('tenants')
                .select(`
          *,
          user_profiles!inner(full_name)
        `)
                .eq('is_active', true)
                .order('user_profiles(full_name)')

            if (data) {
                setTenants(data)
            }
        }
        loadTenants()
    }, [])

    // Load rent cycles when tenant selected
    useEffect(() => {
        if (!formData.tenant_id) {
            setRentCycles([])
            return
        }

        async function loadRentCycles() {
            // Use RPC function to get cycles with pending amounts including late fees
            const { data, error } = await supabase
                .rpc('get_pending_rent_cycles', { p_tenant_id: formData.tenant_id })

            if (error) {
                console.error('Error loading rent cycles:', error)
                // Fallback to regular query
                const { data: fallbackData } = await supabase
                    .from('rent_cycles')
                    .select('*')
                    .eq('tenant_id', formData.tenant_id)
                    .in('status', ['pending', 'overdue'])
                    .order('due_date', { ascending: true })

                if (fallbackData) {
                    setRentCycles(fallbackData.map((rc: any) => ({
                        ...rc,
                        total_due: rc.amount_due + (rc.late_fee_amount || 0),
                        pending_amount: rc.amount_due + (rc.late_fee_amount || 0)
                    })))
                    if (fallbackData.length > 0) {
                        const oldest = fallbackData[0]
                        setFormData(prev => ({
                            ...prev,
                            rent_cycle_id: oldest.id,
                            amount: (oldest.amount_due + (oldest.late_fee_amount || 0)).toString(),
                        }))
                    }
                }
                return
            }

            if (data) {
                setRentCycles(data)
                // Auto-select oldest overdue if available
                if (data.length > 0) {
                    const oldest = data[0]
                    setFormData(prev => ({
                        ...prev,
                        rent_cycle_id: oldest.id,
                        amount: oldest.pending_amount.toString(),
                    }))
                }
            }
        }
        loadRentCycles()
    }, [formData.tenant_id])

    // Update amount when rent cycle changes
    useEffect(() => {
        const selectedCycle = rentCycles.find(rc => rc.id === formData.rent_cycle_id)
        if (selectedCycle) {
            // Use pending_amount if available, otherwise calculate
            const amountToSet = selectedCycle.pending_amount 
                || (selectedCycle.total_due || (selectedCycle.amount_due + (selectedCycle.late_fee_amount || 0)))
            setFormData(prev => ({
                ...prev,
                amount: amountToSet.toString(),
            }))
        }
    }, [formData.rent_cycle_id, rentCycles])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Use API route for payment processing (handles partial, advance, multi-cycle)
            const response = await fetch('/api/admin/payments/mark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenant_id: formData.tenant_id,
                    rent_cycle_id: formData.rent_cycle_id || null, // null = multi-cycle/advance
                    amount: parseFloat(formData.amount),
                    payment_mode: formData.payment_mode,
                    payment_date: formData.payment_date,
                    notes: formData.notes
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to mark payment')
            }

            // Redirect to payments list
            router.push('/admin/payments')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Failed to mark payment')
        } finally {
            setLoading(false)
        }
    }

    const selectedTenant = tenants.find(t => t.id === formData.tenant_id)
    const selectedCycle = rentCycles.find(rc => rc.id === formData.rent_cycle_id)

    const paymentModes = [
        { id: 'CASH', label: 'Cash', icon: Banknote },
        { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: CreditCard },
        { id: 'UPI_MANUAL', label: 'UPI (Manual)', icon: Wallet },
    ]

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
            {/* Header */}
            <header className="bg-[#111] border-b border-zinc-900 sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/payments" className="text-zinc-400 hover:text-white transition flex items-center gap-2">
                            <ArrowLeft className="w-5 h-5" /> Back
                        </Link>
                        <h1 className="text-xl font-bold text-white tracking-tight">Mark Manual Payment</h1>
                    </div>
                </div>
            </header>

            {/* Form */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-[#151515] rounded-xl border border-zinc-800 p-6 shadow-xl relative overflow-hidden">

                    {/* Glowing effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#bef264] opacity-5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                            <Info className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {/* Tenant Selection */}
                        <div>
                            <label htmlFor="tenant_id" className="block text-sm font-medium text-zinc-400 mb-2">
                                Select Tenant *
                            </label>
                            <select
                                id="tenant_id"
                                required
                                value={formData.tenant_id}
                                onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value, rent_cycle_id: '', amount: '' })}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors appearance-none"
                            >
                                <option value="">-- Select Tenant --</option>
                                {tenants.map((tenant) => (
                                    <option key={tenant.id} value={tenant.id}>
                                        {tenant.user_profiles.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Rent Cycle Selection */}
                        {formData.tenant_id && (
                            <div className="space-y-2">
                                <label htmlFor="rent_cycle_id" className="block text-sm font-medium text-zinc-400">
                                    For Month (Optional - leave empty for multi-cycle/advance payment)
                                </label>
                                <select
                                    id="rent_cycle_id"
                                    value={formData.rent_cycle_id}
                                    onChange={(e) => setFormData({ ...formData, rent_cycle_id: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors appearance-none"
                                >
                                    <option value="">-- All Pending Cycles (Auto-allocate) --</option>
                                    {rentCycles.map((cycle: any) => {
                                        const totalDue = cycle.total_due || (cycle.amount_due + (cycle.late_fee_amount || 0))
                                        const pending = cycle.pending_amount || totalDue
                                        return (
                                            <option key={cycle.id} value={cycle.id}>
                                                {new Date(cycle.due_year, cycle.due_month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                                {' - '}
                                                {formatCurrency(pending)}
                                                {cycle.status === 'overdue' ? ' (OVERDUE)' : ''}
                                                {cycle.late_fee_amount > 0 ? ` (Late Fee: ${formatCurrency(cycle.late_fee_amount)})` : ''}
                                            </option>
                                        )
                                    })}
                                </select>
                                {rentCycles.length === 0 && (
                                    <div className="flex items-center gap-2 text-blue-500 text-sm bg-blue-500/10 p-3 rounded border border-blue-500/20">
                                        <Info className="w-4 h-4" /> 
                                        <div>
                                            <p className="font-medium">No pending rent cycles for this tenant</p>
                                            <p className="text-xs text-blue-400 mt-1">
                                                You can still record an advance payment. Leave month selection empty and enter amount.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {rentCycles.length > 0 && (
                                    <div className="text-xs text-zinc-500 mt-2">
                                        💡 Tip: Leave month unselected and enter total amount to pay multiple cycles at once (oldest first)
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment Details */}
                        {formData.rent_cycle_id && (
                            <div className="space-y-6 pt-4 border-t border-zinc-800">
                                {/* Payment Mode */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-3">
                                        Payment Mode *
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {paymentModes.map((mode) => (
                                            <button
                                                key={mode.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, payment_mode: mode.id as any })}
                                                className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg text-sm font-bold transition-all ${formData.payment_mode === mode.id
                                                    ? 'bg-[#bef264] text-black border-[#bef264] shadow-[0_0_15px_-3px_#bef264]'
                                                    : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                                    }`}
                                            >
                                                <mode.icon className="w-4 h-4" />
                                                {mode.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Amount */}
                                    <div>
                                        <label htmlFor="amount" className="block text-sm font-medium text-zinc-400 mb-2">
                                            Amount (₹) *
                                        </label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                            <input
                                                id="amount"
                                                type="number"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors placeholder-zinc-600"
                                                placeholder="5000"
                                            />
                                        </div>
                                        {selectedCycle && (() => {
                                            const totalDue = selectedCycle.total_due || (selectedCycle.amount_due + (selectedCycle.late_fee_amount || 0))
                                            const paymentAmount = parseFloat(formData.amount || '0')
                                            const pending = selectedCycle.pending_amount || totalDue
                                            
                                            if (paymentAmount < pending) {
                                                return (
                                                    <p className="mt-2 text-xs text-yellow-500 flex items-center gap-1">
                                                        <Info className="w-3 h-3" /> Partial payment: {formatCurrency(paymentAmount)} of {formatCurrency(pending)} pending
                                                    </p>
                                                )
                                            } else if (paymentAmount > pending) {
                                                return (
                                                    <p className="mt-2 text-xs text-blue-500 flex items-center gap-1">
                                                        <Info className="w-3 h-3" /> Advance payment: {formatCurrency(paymentAmount - pending)} will be applied to next month
                                                    </p>
                                                )
                                            }
                                            return null
                                        })()}
                                    </div>

                                    {/* Payment Date */}
                                    <div>
                                        <label htmlFor="payment_date" className="block text-sm font-medium text-zinc-400 mb-2">
                                            Payment Date *
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                            <input
                                                id="payment_date"
                                                type="date"
                                                required
                                                value={formData.payment_date}
                                                max={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-zinc-400 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors resize-none placeholder-zinc-600"
                                        placeholder="Any additional details reference numbers, etc..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Summary */}
                        {formData.rent_cycle_id && selectedTenant && selectedCycle && (
                            <div className="bg-[#bef264]/5 border border-[#bef264]/20 rounded-xl p-5">
                                <h4 className="text-sm font-bold text-[#bef264] mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Payment Summary
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2 border-dashed">
                                        <span className="text-zinc-400">Tenant</span>
                                        <span className="text-white font-medium">{selectedTenant.user_profiles.full_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2 border-dashed">
                                        <span className="text-zinc-400">For Month</span>
                                        <span className="text-white font-medium">
                                            {new Date(selectedCycle.due_year, selectedCycle.due_month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2 border-dashed">
                                        <span className="text-zinc-400">Amount</span>
                                        <span className="text-[#bef264] font-bold text-lg">{formatCurrency(parseFloat(formData.amount || '0'))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-400">Payment Mode</span>
                                        <span className="text-white font-medium bg-zinc-800 px-2 py-1 rounded text-xs uppercase tracking-wider">
                                            {formData.payment_mode.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-2">
                            <Link
                                href="/admin/payments"
                                className="flex-1 px-6 py-3 border border-zinc-700 rounded-lg text-zinc-300 font-medium hover:bg-zinc-800 hover:text-white transition text-center"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading || !formData.tenant_id || !formData.amount}
                                className="flex-1 px-6 py-3 bg-[#bef264] text-black rounded-lg font-bold hover:bg-[#a3d929] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    'Mark Payment as Received'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Box */}
                <div className="mt-6 flex items-start gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
                    <Info className="w-5 h-5 text-zinc-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-bold text-zinc-400 mb-2">Important Notes</h3>
                        <ul className="text-sm text-zinc-500 space-y-1 list-disc list-inside">
                            <li>Manual payments are logged in the <strong>Audit Trail</strong></li>
                            <li>This will automatically update the rent cycle status for the tenant</li>
                            <li>Partial payments are allowed and will be tracked</li>
                            <li>This action updates the financial records immediately</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    )
}
