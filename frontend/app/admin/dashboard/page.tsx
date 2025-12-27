import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import {
    Users,
    Building2,
    CreditCard,
    MessageSquare,
    LayoutDashboard,
    DoorOpen,
    Wallet,
    TrendingUp,
    AlertCircle
} from 'lucide-react'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify admin role
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        redirect('/login')
    }

    // Fetch dashboard data
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    // Get monthly collection summary
    const { data: collectionData } = await supabase
        .from('monthly_collection_summary')
        .select('*')
        .eq('due_month', currentMonth)
        .eq('due_year', currentYear)
        .single()

    // Get room status
    const { data: roomsData } = await supabase
        .from('room_status')
        .select('*')
        .order('room_number')

    // Get recent complaints
    const { data: complaintsData } = await supabase
        .from('complaints')
        .select(`
      *,
      tenants!inner(
        user_profiles!inner(full_name)
      ),
      rooms!inner(room_number)
    `)
        .order('created_at', { ascending: false })
        .limit(5)

    const stats = {
        totalExpected: collectionData?.total_expected || 0,
        totalCollected: collectionData?.total_collected || 0,
        totalPending: collectionData?.total_pending || 0,
        totalTenants: collectionData?.total_rent_cycles || 0,
        paidCount: collectionData?.paid_count || 0,
        pendingCount: collectionData?.pending_count || 0,
        overdueCount: collectionData?.overdue_count || 0,
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
            {/* Header */}
            <header className="bg-[#111] border-b border-zinc-900 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#bef264] flex items-center justify-center text-black font-bold">
                                A
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">Admin Dashboard</h1>
                                <p className="text-xs text-zinc-500">Overview for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-medium text-zinc-200">{profile.full_name}</div>
                                <div className="text-xs text-[#bef264]">Property Manager</div>
                            </div>
                            <form action="/auth/signout" method="post">
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-medium bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg transition-all hover:border-zinc-700"
                                >
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Expected */}
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Wallet className="w-16 h-16 text-zinc-400" />
                        </div>
                        <div className="text-sm font-medium text-zinc-400 mb-1">Total Expected</div>
                        <div className="text-2xl font-bold text-white tracking-tight">
                            {formatCurrency(stats.totalExpected)}
                        </div>
                        <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1">
                            <Users className="w-3 h-3" /> {stats.totalTenants} active tenants
                        </div>
                    </div>

                    {/* Total Collected */}
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="w-16 h-16 text-[#bef264]" />
                        </div>
                        <div className="text-sm font-medium text-zinc-400 mb-1">Collected Revenue</div>
                        <div className="text-2xl font-bold text-[#bef264] tracking-tight">
                            {formatCurrency(stats.totalCollected)}
                        </div>
                        <div className="mt-2 text-xs text-green-400">
                            {stats.paidCount} payments received
                        </div>
                    </div>

                    {/* Total Pending */}
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <AlertCircle className="w-16 h-16 text-orange-500" />
                        </div>
                        <div className="text-sm font-medium text-zinc-400 mb-1">Pending Amount</div>
                        <div className="text-2xl font-bold text-orange-400 tracking-tight">
                            {formatCurrency(stats.totalPending)}
                        </div>
                        <div className="mt-2 text-xs text-orange-400">
                            {stats.pendingCount} tenants pending
                        </div>
                    </div>

                    {/* Overdue */}
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <AlertCircle className="w-16 h-16 text-red-500" />
                        </div>
                        <div className="text-sm font-medium text-zinc-400 mb-1">Overdue Accounts</div>
                        <div className="text-2xl font-bold text-red-500 tracking-tight">
                            {stats.overdueCount}
                        </div>
                        <div className="mt-2 text-xs text-red-400">
                            Immediate attention needed
                        </div>
                    </div>
                </div>

                {/* Dashboard Widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Room Status (Larger) */}
                    <div className="lg:col-span-2 bg-[#151515] rounded-xl border border-zinc-800 flex flex-col">
                        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-[#1a1a1a] rounded-t-xl">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[#bef264]" /> Room Occupancy
                            </h2>
                            <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                                {roomsData ? roomsData.length : 0} Units
                            </span>
                        </div>
                        <div className="p-4 flex-1 overflow-auto max-h-[400px]">
                            {roomsData && roomsData.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {roomsData.slice(0, 10).map((room: any) => (
                                        <div key={room.room_id} className="flex justify-between items-center p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:border-[#bef264]/30 transition-colors">
                                            <div>
                                                <div className="font-medium text-white flex items-center gap-2">
                                                    Room {room.room_number}
                                                    <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">F{room.floor_number}</span>
                                                </div>
                                                <div className="text-xs text-zinc-500 mt-1">
                                                    {room.current_tenants}/{room.capacity} beds filled
                                                </div>
                                            </div>
                                            <span
                                                className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${room.occupancy_status === 'full'
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                        : room.occupancy_status === 'vacant'
                                                            ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}
                                            >
                                                {room.occupancy_status}
                                            </span>
                                        </div>
                                    ))}
                                    {roomsData.length > 10 && (
                                        <div className="col-span-1 md:col-span-2 text-center py-2 text-xs text-zinc-500">
                                            + {roomsData.length - 10} more rooms
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-zinc-500">
                                    <p>No rooms found. Add rooms to get started.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-t border-zinc-800">
                            <a href="/admin/rooms" className="text-sm text-[#bef264] hover:underline flex items-center justify-center gap-1">
                                View All Rooms <TrendingUp className="w-3 h-3" />
                            </a>
                        </div>
                    </div>

                    {/* Recent Complaints */}
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 flex flex-col">
                        <div className="px-6 py-4 border-b border-zinc-800 bg-[#1a1a1a] rounded-t-xl">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-red-400" /> Issues
                            </h2>
                        </div>
                        <div className="p-4 flex-1">
                            {complaintsData && complaintsData.length > 0 ? (
                                <div className="space-y-3">
                                    {complaintsData.map((complaint: any) => (
                                        <div key={complaint.id} className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${complaint.status === 'open' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        complaint.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                            'bg-green-500/10 text-green-400 border-green-500/20'
                                                    }`}>
                                                    {complaint.status.toUpperCase()}
                                                </span>
                                                <span className="text-[10px] text-zinc-500">{new Date(complaint.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="font-medium text-sm text-zinc-200 line-clamp-1">{complaint.title}</div>
                                            <div className="text-xs text-zinc-500 mt-1 flex justify-between">
                                                <span>Rm {complaint.rooms.room_number}</span>
                                                <span>{complaint.category}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-2">
                                    <MessageSquare className="w-8 h-8 opacity-20" />
                                    <p className="text-sm">No recent complaints</p>
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-t border-zinc-800">
                            <a href="/admin/complaints" className="text-sm text-zinc-400 hover:text-white flex items-center justify-center">
                                View Resolution Center
                            </a>
                        </div>
                    </div>
                </div>

                {/* Quick Actions (Themed) */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-[#bef264]" /> Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <a href="/admin/tenants" className="group p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#bef264] hover:bg-[#bef264]/5 transition-all flex flex-col items-center justify-center gap-2 text-center">
                            <Users className="w-8 h-8 text-indigo-400 group-hover:text-[#bef264] transition-colors" />
                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Tenants</span>
                        </a>
                        <a href="/admin/rooms" className="group p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#bef264] hover:bg-[#bef264]/5 transition-all flex flex-col items-center justify-center gap-2 text-center">
                            <DoorOpen className="w-8 h-8 text-blue-400 group-hover:text-[#bef264] transition-colors" />
                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Rooms</span>
                        </a>
                        <a href="/admin/buildings" className="group p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#bef264] hover:bg-[#bef264]/5 transition-all flex flex-col items-center justify-center gap-2 text-center">
                            <Building2 className="w-8 h-8 text-purple-400 group-hover:text-[#bef264] transition-colors" />
                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Buildings</span>
                        </a>
                        <a href="/admin/payments" className="group p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#bef264] hover:bg-[#bef264]/5 transition-all flex flex-col items-center justify-center gap-2 text-center">
                            <CreditCard className="w-8 h-8 text-green-400 group-hover:text-[#bef264] transition-colors" />
                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Payments</span>
                        </a>
                        <a href="/admin/complaints" className="group p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#bef264] hover:bg-[#bef264]/5 transition-all flex flex-col items-center justify-center gap-2 text-center">
                            <MessageSquare className="w-8 h-8 text-orange-400 group-hover:text-[#bef264] transition-colors" />
                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Complaints</span>
                        </a>
                    </div>
                </div>
            </main>
        </div>
    )
}
