'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

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
            const { data } = await supabase
                .from('rent_cycles')
                .select('*')
                .eq('tenant_id', formData.tenant_id)
                .in('status', ['pending', 'overdue'])
                .order('due_date', { ascending: false })

            if (data) {
                setRentCycles(data)
                // Auto-select most overdue if available
                if (data.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        rent_cycle_id: data[data.length - 1].id,
                        amount: data[data.length - 1].amount_due.toString(),
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
            setFormData(prev => ({
                ...prev,
                amount: selectedCycle.amount_due.toString(),
            }))
        }
    }, [formData.rent_cycle_id, rentCycles])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Get current admin user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Insert payment
            const { error: insertError } = await supabase
                .from('payments')
                .insert({
                    tenant_id: formData.tenant_id,
                    rent_cycle_id: formData.rent_cycle_id,
                    amount: parseFloat(formData.amount),
                    payment_mode: formData.payment_mode,
                    payment_date: formData.payment_date,
                    notes: formData.notes,
                    received_by: user.id,
                    is_verified: true, // Manual payments are auto-verified
                })

            if (insertError) throw insertError

            // Redirect to payments list
            router.push('/admin/payments')
        } catch (err: any) {
            setError(err.message || 'Failed to mark payment')
        } finally {
            setLoading(false)
        }
    }

    const selectedTenant = tenants.find(t => t.id === formData.tenant_id)
    const selectedCycle = rentCycles.find(rc => rc.id === formData.rent_cycle_id)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/payments" className="text-gray-600 hover:text-gray-900">
                            ← Back
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Mark Manual Payment</h1>
                    </div>
                </div>
            </header>

            {/* Form */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Tenant Selection */}
                        <div>
                            <label htmlFor="tenant_id" className="block text-sm font-medium text-gray-700 mb-2">
                                Select Tenant *
                            </label>
                            <select
                                id="tenant_id"
                                required
                                value={formData.tenant_id}
                                onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value, rent_cycle_id: '', amount: '' })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
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
                            <div>
                                <label htmlFor="rent_cycle_id" className="block text-sm font-medium text-gray-700 mb-2">
                                    For Month *
                                </label>
                                <select
                                    id="rent_cycle_id"
                                    required
                                    value={formData.rent_cycle_id}
                                    onChange={(e) => setFormData({ ...formData, rent_cycle_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                >
                                    <option value="">-- Select Month --</option>
                                    {rentCycles.map((cycle) => (
                                        <option key={cycle.id} value={cycle.id}>
                                            {new Date(cycle.due_year, cycle.due_month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                            {' - '}
                                            {formatCurrency(cycle.amount_due)}
                                            {cycle.status === 'overdue' ? ' (OVERDUE)' : ''}
                                        </option>
                                    ))}
                                </select>
                                {rentCycles.length === 0 && (
                                    <p className="mt-1 text-xs text-gray-500">No pending rent cycles for this tenant</p>
                                )}
                            </div>
                        )}

                        {/* Payment Details */}
                        {formData.rent_cycle_id && (
                            <>
                                {/* Payment Mode */}
                                <div>
                                    <label htmlFor="payment_mode" className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Mode *
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['CASH', 'BANK_TRANSFER', 'UPI_MANUAL'].map((mode) => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, payment_mode: mode as any })}
                                                className={`px-4 py-3 border rounded-lg text-sm font-medium transition ${formData.payment_mode === mode
                                                        ? 'border-green-600 bg-green-50 text-green-700'
                                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {mode.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount (₹) *
                                    </label>
                                    <input
                                        id="amount"
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="5000"
                                    />
                                    {selectedCycle && parseFloat(formData.amount) !== selectedCycle.amount_due && (
                                        <p className="mt-1 text-xs text-yellow-600">
                                            Partial payment: {formatCurrency(parseFloat(formData.amount))} of {formatCurrency(selectedCycle.amount_due)}
                                        </p>
                                    )}
                                </div>

                                {/* Payment Date */}
                                <div>
                                    <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Date *
                                    </label>
                                    <input
                                        id="payment_date"
                                        type="date"
                                        required
                                        value={formData.payment_date}
                                        max={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                                        placeholder="Any additional details..."
                                    />
                                </div>
                            </>
                        )}

                        {/* Summary */}
                        {formData.rent_cycle_id && selectedTenant && selectedCycle && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-green-900 mb-2">Payment Summary</h4>
                                <dl className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <dt className="text-green-700">Tenant:</dt>
                                        <dd className="text-green-900 font-medium">{selectedTenant.user_profiles.full_name}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-green-700">For Month:</dt>
                                        <dd className="text-green-900 font-medium">
                                            {new Date(selectedCycle.due_year, selectedCycle.due_month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-green-700">Amount:</dt>
                                        <dd className="text-green-900 font-medium">{formatCurrency(parseFloat(formData.amount || '0'))}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-green-700">Mode:</dt>
                                        <dd className="text-green-900 font-medium">{formData.payment_mode.replace('_', ' ')}</dd>
                                    </div>
                                </dl>
                            </div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex gap-4">
                            <Link
                                href="/admin/payments"
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-center"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading || !formData.rent_cycle_id}
                                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {loading ? 'Saving...' : 'Mark Payment'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Important Notes</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Manual payments are logged in audit trail</li>
                        <li>• This will automatically update rent cycle status</li>
                        <li>• Partial payments are allowed</li>
                        <li>• Cannot be undone (contact support if needed)</li>
                    </ul>
                </div>
            </main>
        </div>
    )
}
