import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, Banknote, CreditCard, Wallet, Plus } from 'lucide-react'

export default async function PaymentsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify admin role
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        redirect('/login')
    }

    // Get recent payments
    const { data: payments } = await supabase
        .from('payments')
        .select(`
      *,
      tenants!inner(
        user_profiles!inner(full_name)
      ),
      rent_cycles(due_month, due_year)
    `)
        .order('payment_date', { ascending: false })
        .limit(50)

    // Calculate stats
    const totalPayments = payments?.length || 0
    const totalAmount = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
    const onlinePayments = payments?.filter(p => p.payment_mode === 'ONLINE_GATEWAY').length || 0
    const manualPayments = totalPayments - onlinePayments

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
            {/* Header */}
            <header className="bg-[#111] border-b border-zinc-900 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <Link href="/admin/dashboard" className="text-zinc-400 hover:text-white text-sm mb-2 inline-flex items-center gap-1 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                            </Link>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Payment Management</h1>
                            <p className="text-sm text-zinc-500 mt-1">
                                {totalPayments} payments • {formatCurrency(totalAmount)} collected
                            </p>
                        </div>
                        <Link
                            href="/admin/payments/mark"
                            className="px-4 py-2 bg-[#bef264] text-black font-bold rounded-lg hover:bg-[#a3d929] transition transform active:scale-95 flex items-center gap-2 shadow-[0_0_15px_rgba(190,242,100,0.1)]"
                        >
                            <Plus className="w-4 h-4" /> Mark Payment
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-5 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-zinc-400">Total Payments</div>
                            <div className="mt-2 text-3xl font-bold text-white tracking-tight">{totalPayments}</div>
                        </div>
                        <div className="p-3 bg-zinc-900 rounded-lg">
                            <Banknote className="w-6 h-6 text-zinc-400" />
                        </div>
                    </div>
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-5 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-zinc-400">Total Amount</div>
                            <div className="mt-2 text-3xl font-bold text-green-400 tracking-tight">
                                {formatCurrency(totalAmount)}
                            </div>
                        </div>
                        <div className="p-3 bg-zinc-900 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-5 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-zinc-400">Online</div>
                            <div className="mt-2 text-3xl font-bold text-blue-400 tracking-tight">{onlinePayments}</div>
                        </div>
                        <div className="p-3 bg-zinc-900 rounded-lg">
                            <CreditCard className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-5 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-zinc-400">Manual</div>
                            <div className="mt-2 text-3xl font-bold text-orange-400 tracking-tight">{manualPayments}</div>
                        </div>
                        <div className="p-3 bg-zinc-900 rounded-lg">
                            <Wallet className="w-6 h-6 text-orange-400" />
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-[#151515] rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-[#1a1a1a]">
                        <h2 className="text-lg font-semibold text-white">Recent Payments</h2>
                    </div>

                    {payments && payments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-800/50">
                                <thead className="bg-[#111]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Tenant
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Mode
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            For Month
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Notes
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#151515] divide-y divide-zinc-800">
                                    {payments.map((payment: any) => (
                                        <tr key={payment.id} className="hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                                                {formatDate(payment.payment_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                {payment.tenants.user_profiles.full_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-[#bef264]">
                                                    {formatCurrency(payment.amount)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold uppercase tracking-wide rounded border ${payment.payment_mode === 'ONLINE_GATEWAY'
                                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        : payment.payment_mode === 'CASH'
                                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                        }`}
                                                >
                                                    {payment.payment_mode.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                                                {payment.rent_cycles ?
                                                    `${new Date(payment.rent_cycles.due_year, payment.rent_cycles.due_month - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`
                                                    : '-'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wide ${payment.is_verified
                                                        ? 'text-green-400'
                                                        : 'text-yellow-400'
                                                        }`}
                                                >
                                                    {payment.is_verified ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    {payment.is_verified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-500 max-w-xs truncate">
                                                {payment.notes || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 flex flex-col items-center">
                            <Banknote className="w-12 h-12 text-zinc-700 mb-4" />
                            <h3 className="text-lg font-medium text-white">No payments found</h3>
                            <p className="mt-1 text-sm text-zinc-500">No payment records found.</p>
                            <div className="mt-6">
                                <Link
                                    href="/admin/payments/mark"
                                    className="inline-flex items-center px-4 py-2 bg-[#bef264] text-black font-bold rounded-lg hover:bg-[#a3d929] transition"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Mark Payment
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
