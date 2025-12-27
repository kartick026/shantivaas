import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function TenantDashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify tenant role
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, full_name, email, phone')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'tenant') {
        redirect('/login')
    }

    // Get tenant dashboard data using the view
    const { data: dashboardData } = await supabase
        .from('tenant_dashboard')
        .select('*')
        .eq('user_id', user.id)
        .single()

    // Get rent cycles with payment status
    const { data: rentCycles } = await supabase
        .from('rent_cycles')
        .select(`
      *,
      payments(amount, payment_date, payment_mode)
    `)
        .eq('tenant_id', dashboardData?.tenant_id)
        .order('due_date', { ascending: false })
        .limit(6)

    // Get recent payments
    const { data: recentPayments } = await supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', dashboardData?.tenant_id)
        .order('payment_date', { ascending: false })
        .limit(5)

    // Get active complaints
    const { data: complaints } = await supabase
        .from('complaints')
        .select('*')
        .eq('tenant_id', dashboardData?.tenant_id)
        .order('created_at', { ascending: false })
        .limit(5)

    const stats = {
        totalDue: dashboardData?.total_due_amount || 0,
        pendingPayments: dashboardData?.pending_payments_count || 0,
        openComplaints: dashboardData?.open_complaints_count || 0,
        monthlyRent: dashboardData?.individual_rent || 0,
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Tenant Dashboard</h1>
                            <p className="text-sm text-gray-500">Welcome back, {profile.full_name}</p>
                        </div>
                        <form action="/auth/signout" method="post">
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Room Info Card */}
                {dashboardData && (
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="text-indigo-100 text-sm font-medium">Your Room</div>
                                <div className="text-3xl font-bold mt-1">
                                    Room {dashboardData.room_number}
                                </div>
                                <div className="text-indigo-100 text-sm mt-1">
                                    Floor {dashboardData.floor_number} • {dashboardData.building_name}
                                </div>
                            </div>
                            <div>
                                <div className="text-indigo-100 text-sm font-medium">Monthly Rent</div>
                                <div className="text-3xl font-bold mt-1">
                                    {formatCurrency(stats.monthlyRent)}
                                </div>
                                <div className="text-indigo-100 text-sm mt-1">
                                    Joined on {formatDate(dashboardData.join_date)}
                                </div>
                            </div>
                            <div>
                                <div className="text-indigo-100 text-sm font-medium">Contact Info</div>
                                <div className="text-lg font-medium mt-1">{profile.email}</div>
                                <div className="text-indigo-100 text-sm mt-1">{profile.phone}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Due */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Total Due</div>
                                <div className="mt-2 text-3xl font-bold text-red-600">
                                    {formatCurrency(stats.totalDue)}
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    {stats.pendingPayments} pending payment{stats.pendingPayments !== 1 ? 's' : ''}
                                </div>
                            </div>
                            <div className="bg-red-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Rent */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Monthly Rent</div>
                                <div className="mt-2 text-3xl font-bold text-gray-900">
                                    {formatCurrency(stats.monthlyRent)}
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    Fixed amount
                                </div>
                            </div>
                            <div className="bg-blue-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Active Complaints */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Active Complaints</div>
                                <div className="mt-2 text-3xl font-bold text-orange-600">
                                    {stats.openComplaints}
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    Open tickets
                                </div>
                            </div>
                            <div className="bg-orange-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Rent Payment Status */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Rent Payment Status</h2>
                            {stats.totalDue > 0 && (
                                <a
                                    href="/tenant/pay-rent"
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                >
                                    Pay Now →
                                </a>
                            )}
                        </div>
                        <div className="p-6">
                            {rentCycles && rentCycles.length > 0 ? (
                                <div className="space-y-3">
                                    {rentCycles.map((cycle: any) => {
                                        const totalPaid = cycle.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
                                        const isPaid = cycle.status === 'paid'
                                        const isOverdue = cycle.status === 'overdue'

                                        return (
                                            <div key={cycle.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {new Date(cycle.due_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatCurrency(cycle.amount_due)} • Due {formatDate(cycle.due_date)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span
                                                        className={`px-3 py-1 text-xs font-medium rounded-full ${isPaid
                                                                ? 'bg-green-100 text-green-800'
                                                                : isOverdue
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}
                                                    >
                                                        {cycle.status}
                                                    </span>
                                                    {totalPaid > 0 && !isPaid && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Paid: {formatCurrency(totalPaid)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No rent cycles found</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
                        </div>
                        <div className="p-6">
                            {recentPayments && recentPayments.length > 0 ? (
                                <div className="space-y-3">
                                    {recentPayments.map((payment: any) => (
                                        <div key={payment.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {formatCurrency(payment.amount)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatDate(payment.payment_date)} • {payment.payment_mode.replace('_', ' ')}
                                                </div>
                                            </div>
                                            <span className="text-green-600 font-medium text-sm">
                                                ✓ Paid
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No payment history</p>
                            )}
                        </div>
                    </div>

                    {/* Complaints */}
                    <div className="bg-white rounded-lg shadow lg:col-span-2">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">My Complaints</h2>
                            <a
                                href="/tenant/complaints/new"
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                            >
                                + New Complaint
                            </a>
                        </div>
                        <div className="p-6">
                            {complaints && complaints.length > 0 ? (
                                <div className="space-y-4">
                                    {complaints.map((complaint: any) => (
                                        <div key={complaint.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">{complaint.description}</p>
                                                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                                                        <span className="capitalize">{complaint.category}</span>
                                                        <span>•</span>
                                                        <span>{formatDate(complaint.created_at)}</span>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-4 ${complaint.status === 'open'
                                                            ? 'bg-red-100 text-red-800'
                                                            : complaint.status === 'in_progress'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : complaint.status === 'resolved'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {complaint.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-500">No complaints submitted yet</p>
                                    <a
                                        href="/tenant/complaints/new"
                                        className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                    >
                                        Submit your first complaint →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                {stats.totalDue > 0 && (
                    <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Outstanding Balance
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    You have {formatCurrency(stats.totalDue)} pending. Please pay at your earliest convenience.
                                </p>
                            </div>
                            <a
                                href="/tenant/pay-rent"
                                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition whitespace-nowrap"
                            >
                                Pay Now
                            </a>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
