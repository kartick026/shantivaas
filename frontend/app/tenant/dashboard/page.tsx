import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import PayButton from '@/components/PayButton'
import { LogOut, Home, IndianRupee, AlertCircle, Clock, CheckCircle2, AlertTriangle, Plus } from 'lucide-react'

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
    const tenantId = dashboardData?.tenant_id
    
    let rentCycles: any[] = []
    if (tenantId) {
        // Get rent cycles with calculated pending amounts
        const { data: cyclesWithPending, error: pendingError } = await supabase
            .rpc('get_pending_rent_cycles', { p_tenant_id: tenantId })
        
        // Get all cycles (including paid ones) for display
        const { data: allCycles, error: cyclesError } = await supabase
            .from('rent_cycles')
            .select(`
                *,
                payments(amount, payment_date, payment_mode, is_verified)
            `)
            .eq('tenant_id', tenantId)
            .order('due_date', { ascending: false })
            .limit(12)
        
        if (cyclesError) {
            console.error('Error loading rent cycles:', cyclesError)
        }
        
        // Merge data: use pending amounts from RPC function if available
        if (allCycles) {
            rentCycles = allCycles.map((cycle: any) => {
                const pendingData = cyclesWithPending?.find((p: any) => p.id === cycle.id)
                const totalPaid = cycle.payments
                    ?.filter((p: any) => p.is_verified)
                    .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0
                const totalDue = parseFloat(cycle.amount_due) + (parseFloat(cycle.late_fee_amount) || 0)
                const calculatedPending = Math.max(0, totalDue - totalPaid)
                
                return {
                    ...cycle,
                    total_due: totalDue,
                    total_paid: totalPaid,
                    pending_amount: pendingData?.pending_amount 
                        ? parseFloat(pendingData.pending_amount.toString()) 
                        : calculatedPending,
                    late_fee_amount: parseFloat(cycle.late_fee_amount) || 0
                }
            })
        } else if (!allCycles && pendingError) {
            // Fallback: if RPC fails, still try to show cycles
            console.warn('RPC function failed, using direct query:', pendingError)
        }
    }

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

    // Calculate accurate total due from rent cycles
    const totalPending = rentCycles
        ?.filter((rc: any) => rc.status !== 'paid')
        .reduce((sum: number, rc: any) => sum + (rc.pending_amount || 0), 0) || 0
    
    const pendingCount = rentCycles?.filter((rc: any) => {
        const pending = rc.pending_amount || 0
        return rc.status !== 'paid' && pending > 0
    }).length || 0

    const stats = {
        totalDue: totalPending || dashboardData?.total_due_amount || 0,
        pendingPayments: pendingCount || dashboardData?.pending_payments_count || 0,
        openComplaints: dashboardData?.open_complaints_count || 0,
        monthlyRent: dashboardData?.individual_rent || 0,
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
            {/* Header */}
            <header className="bg-[#111] border-b border-zinc-900 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">Tenant Dashboard</h1>
                            <p className="text-sm text-zinc-500">Welcome back, {profile.full_name}</p>
                        </div>
                        <form action="/auth/signout" method="post">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white border border-zinc-800 rounded-lg hover:bg-zinc-800 transition"
                            >
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Room Info Card */}
                {dashboardData && (
                    <div className="relative overflow-hidden bg-[#151515] rounded-2xl border border-zinc-800 p-8">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#bef264] opacity-5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <div className="text-[#bef264] text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Home className="w-4 h-4" /> Your Room
                                </div>
                                <div className="text-4xl font-bold text-white tracking-tight">
                                    Room {dashboardData.room_number}
                                </div>
                                <div className="text-zinc-400 text-sm mt-2">
                                    Floor {dashboardData.floor_number} • {dashboardData.building_name}
                                </div>
                            </div>
                            <div className="md:border-l md:border-zinc-800 md:pl-8">
                                <div className="text-[#bef264] text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <IndianRupee className="w-4 h-4" /> Monthly Rent
                                </div>
                                <div className="text-4xl font-bold text-white tracking-tight">
                                    {formatCurrency(stats.monthlyRent)}
                                </div>
                                <div className="text-zinc-400 text-sm mt-2">
                                    Joined on {formatDate(dashboardData.join_date)}
                                </div>
                            </div>
                            <div className="md:border-l md:border-zinc-800 md:pl-8">
                                <div className="text-[#bef264] text-sm font-bold uppercase tracking-wider mb-2">Contact Info</div>
                                <div className="text-lg font-medium text-white">{profile.email}</div>
                                <div className="text-zinc-400 text-sm mt-1">{profile.phone}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Due */}
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-6 flex flex-col justify-between hover:border-red-500/30 transition-colors">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-sm font-medium text-zinc-400">Total Due</div>
                                <div className="mt-2 text-3xl font-bold text-red-500 tracking-tight">
                                    {formatCurrency(stats.totalDue)}
                                </div>
                            </div>
                            <div className="p-3 bg-red-500/10 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-red-500" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-medium text-zinc-500">
                            {stats.pendingPayments} pending payment{stats.pendingPayments !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Monthly Rent */}
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-6 flex flex-col justify-between group hover:border-[#bef264]/30 transition-colors">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-sm font-medium text-zinc-400">Monthly Rent</div>
                                <div className="mt-2 text-3xl font-bold text-white group-hover:text-[#bef264] transition-colors tracking-tight">
                                    {formatCurrency(stats.monthlyRent)}
                                </div>
                            </div>
                            <div className="p-3 bg-zinc-900 rounded-lg group-hover:bg-[#bef264]/10 transition-colors">
                                <IndianRupee className="w-6 h-6 text-zinc-400 group-hover:text-[#bef264]" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-medium text-zinc-500">
                            Fixed monthly amount
                        </div>
                    </div>

                    {/* Active Complaints */}
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-6 flex flex-col justify-between hover:border-orange-500/30 transition-colors">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-sm font-medium text-zinc-400">Active Complaints</div>
                                <div className="mt-2 text-3xl font-bold text-orange-500 tracking-tight">
                                    {stats.openComplaints}
                                </div>
                            </div>
                            <div className="p-3 bg-orange-500/10 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-orange-500" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-medium text-zinc-500">
                            Open tickets
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Rent Payment Status */}
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-[#1a1a1a]">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#bef264]" /> Rent Cycles
                            </h2>
                            {stats.totalDue > 0 && rentCycles && rentCycles.some((rc: any) => {
                                const pending = rc.pending_amount || 0
                                return rc.status !== 'paid' && pending > 0
                            }) && (
                                <PayButton
                                    amount={rentCycles.find((rc: any) => {
                                        const pending = rc.pending_amount || 0
                                        return rc.status !== 'paid' && pending > 0
                                    })?.pending_amount || stats.totalDue}
                                    rentCycleId={null} // null = pay oldest pending
                                    className="text-xs font-bold text-[#bef264] hover:text-[#a3d929] uppercase tracking-wide"
                                    buttonText="Pay All →"
                                />
                            )}
                        </div>
                        <div className="p-0">
                            {rentCycles && rentCycles.length > 0 ? (
                                <div className="divide-y divide-zinc-800">
                                    {rentCycles.map((cycle: any) => {
                                        const totalPaid = cycle.total_paid || 0
                                        const totalDue = cycle.total_due || (cycle.amount_due + (cycle.late_fee_amount || 0))
                                        const pendingAmount = cycle.pending_amount || Math.max(0, totalDue - totalPaid)
                                        const isPaid = cycle.status === 'paid' || pendingAmount <= 0
                                        const isOverdue = cycle.status === 'overdue'
                                        const hasLateFee = (cycle.late_fee_amount || 0) > 0
                                        const isPartial = totalPaid > 0 && pendingAmount > 0

                                        return (
                                            <div key={cycle.id} className="flex justify-between items-center p-4 hover:bg-zinc-800/30 transition-colors">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-bold text-zinc-200">
                                                            {new Date(cycle.due_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                                        </div>
                                                        {hasLateFee && (
                                                            <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">
                                                                Late Fee
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-zinc-500 mt-1 space-y-0.5">
                                                        <div>
                                                            {formatCurrency(totalDue)} total • Due {formatDate(cycle.due_date)}
                                                        </div>
                                                        {hasLateFee && (
                                                            <div className="text-red-400">
                                                                Rent: {formatCurrency(cycle.amount_due)} + Late Fee: {formatCurrency(cycle.late_fee_amount)}
                                                            </div>
                                                        )}
                                                        {isPartial && (
                                                            <div className="text-yellow-400">
                                                                Paid: {formatCurrency(totalPaid)} • Pending: {formatCurrency(pendingAmount)}
                                                            </div>
                                                        )}
                                                        {isPaid && totalPaid > 0 && (
                                                            <div className="text-green-400">
                                                                ✓ Paid: {formatCurrency(totalPaid)} on {cycle.payments?.filter((p: any) => p.is_verified)?.[0]?.payment_date ? formatDate(cycle.payments.filter((p: any) => p.is_verified)[0].payment_date) : ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-2 ml-4">
                                                    <span
                                                        className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded border whitespace-nowrap ${isPaid
                                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                            : isOverdue
                                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                            }`}
                                                    >
                                                        {isPaid ? 'paid' : cycle.status}
                                                    </span>
                                                    {!isPaid && pendingAmount > 0 && (
                                                        <PayButton
                                                            amount={pendingAmount}
                                                            rentCycleId={cycle.id}
                                                            buttonText={isPartial ? `Pay ₹${Math.round(pendingAmount)}` : "Pay Now"}
                                                            className="px-3 py-1.5 bg-[#bef264] text-black text-xs font-bold rounded hover:bg-[#a3d929] transition whitespace-nowrap"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-zinc-500 text-sm">No rent cycles found</div>
                            )}
                        </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-zinc-800 bg-[#1a1a1a]">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-400" /> Recent Payments
                            </h2>
                        </div>
                        <div className="p-0">
                            {recentPayments && recentPayments.length > 0 ? (
                                <div className="divide-y divide-zinc-800">
                                    {recentPayments.map((payment: any) => (
                                        <div key={payment.id} className="flex justify-between items-center p-4 hover:bg-zinc-800/30 transition-colors">
                                            <div>
                                                <div className="font-bold text-white">
                                                    {formatCurrency(payment.amount)}
                                                </div>
                                                <div className="text-xs text-zinc-500 mt-1">
                                                    {formatDate(payment.payment_date)} • <span className="uppercase text-zinc-400">{payment.payment_mode.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                            <span className="text-green-400 font-bold text-xs uppercase tracking-wide flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Paid
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-zinc-500 text-sm">No payment history found</div>
                            )}
                        </div>
                    </div>

                    {/* Complaints */}
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 lg:col-span-2 overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-[#1a1a1a]">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-400" /> My Complaints
                            </h2>
                            <a
                                href="/tenant/complaints/new"
                                className="px-3 py-1.5 bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-[#bef264] hover:text-[#bef264] text-xs font-bold uppercase tracking-wide rounded transition flex items-center gap-2"
                            >
                                <Plus className="w-3 h-3" /> New Complaint
                            </a>
                        </div>
                        <div className="p-6">
                            {complaints && complaints.length > 0 ? (
                                <div className="space-y-4">
                                    {complaints.map((complaint: any) => (
                                        <div key={complaint.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-white text-sm">{complaint.title}</h3>
                                                    <p className="text-sm text-zinc-400 mt-1">{complaint.description}</p>
                                                    <div className="mt-2 flex items-center gap-3 text-xs text-zinc-600">
                                                        <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase tracking-wider text-[10px]">{complaint.category}</span>
                                                        <span>•</span>
                                                        <span>{formatDate(complaint.created_at)}</span>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded border ml-4 whitespace-nowrap ${complaint.status === 'open'
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        : complaint.status === 'in_progress'
                                                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                            : complaint.status === 'resolved'
                                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                                        }`}
                                                >
                                                    {complaint.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                                        <AlertTriangle className="w-6 h-6 text-zinc-600" />
                                    </div>
                                    <p className="text-sm text-zinc-500">No complaints submitted yet</p>
                                    <a
                                        href="/tenant/complaints/new"
                                        className="mt-4 text-sm font-bold text-[#bef264] hover:underline"
                                    >
                                        Submit your first complaint →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Outstanding Balance Alert */}
                {stats.totalDue > 0 && (
                    <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-500/20 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-400">
                                    Outstanding Balance
                                </h3>
                                <p className="text-sm text-red-200/70 mt-1">
                                    You have <span className="font-bold text-red-200">{formatCurrency(stats.totalDue)}</span> pending. Please pay at your earliest convenience to avoid penalties.
                                </p>
                            </div>
                        </div>
                        {rentCycles && rentCycles.some((rc: any) => {
                            const pending = rc.pending_amount || 0
                            return rc.status !== 'paid' && pending > 0
                        }) ? (
                            <PayButton
                                amount={stats.totalDue}
                                rentCycleId={null} // null = pay all cycles at once
                                className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition whitespace-nowrap shadow-lg shadow-red-900/20"
                                buttonText="Pay All Outstanding Now"
                            />
                        ) : (
                            <div className="px-8 py-3 bg-zinc-800 text-zinc-400 font-bold rounded-lg border border-zinc-700 whitespace-nowrap">
                                All Paid ✓
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
