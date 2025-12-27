import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-sm text-gray-500">Welcome back, {profile.full_name}</p>
                        </div>
                        <form action="/auth/signout" method="post">
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                            >
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Expected */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm font-medium text-gray-500">Total Expected</div>
                        <div className="mt-2 text-3xl font-bold text-gray-900">
                            {formatCurrency(stats.totalExpected)}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            {stats.totalTenants} tenants
                        </div>
                    </div>

                    {/* Total Collected */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm font-medium text-gray-500">Total Collected</div>
                        <div className="mt-2 text-3xl font-bold text-green-600">
                            {formatCurrency(stats.totalCollected)}
                        </div>
                        <div className="mt-2 text-xs text-green-600">
                            {stats.paidCount} paid
                        </div>
                    </div>

                    {/* Total Pending */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm font-medium text-gray-500">Total Pending</div>
                        <div className="mt-2 text-3xl font-bold text-orange-600">
                            {formatCurrency(stats.totalPending)}
                        </div>
                        <div className="mt-2 text-xs text-orange-600">
                            {stats.pendingCount} pending
                        </div>
                    </div>

                    {/* Overdue */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm font-medium text-gray-500">Overdue</div>
                        <div className="mt-2 text-3xl font-bold text-red-600">
                            {stats.overdueCount}
                        </div>
                        <div className="mt-2 text-xs text-red-600">
                            tenants
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Room Status */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Room Status</h2>
                        </div>
                        <div className="p-6">
                            {roomsData && roomsData.length > 0 ? (
                                <div className="space-y-3">
                                    {roomsData.slice(0, 5).map((room: any) => (
                                        <div key={room.room_id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    Room {room.room_number}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Floor {room.floor_number} • {room.current_tenants}/{room.capacity} occupied
                                                </div>
                                            </div>
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${room.occupancy_status === 'full'
                                                    ? 'bg-green-100 text-green-800'
                                                    : room.occupancy_status === 'vacant'
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {room.occupancy_status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No rooms found</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Complaints */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
                        </div>
                        <div className="p-6">
                            {complaintsData && complaintsData.length > 0 ? (
                                <div className="space-y-3">
                                    {complaintsData.map((complaint: any) => (
                                        <div key={complaint.id} className="py-2 border-b border-gray-100 last:border-0">
                                            <div className="font-medium text-gray-900">{complaint.title}</div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                Room {complaint.rooms.room_number} • {complaint.category}
                                            </div>
                                            <span
                                                className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${complaint.status === 'open'
                                                    ? 'bg-red-100 text-red-800'
                                                    : complaint.status === 'in_progress'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}
                                            >
                                                {complaint.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No complaints</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <a
                        href="/admin/tenants"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-4 text-center font-medium transition"
                    >
                        Manage Tenants
                    </a>
                    <a
                        href="/admin/rooms"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-4 text-center font-medium transition"
                    >
                        View Rooms
                    </a>
                    <a
                        href="/admin/buildings"
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6 py-4 text-center font-medium transition"
                    >
                        Buildings & Floors
                    </a>
                    <a
                        href="/admin/payments"
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-4 text-center font-medium transition"
                    >
                        Mark Payment
                    </a>
                    <a
                        href="/admin/complaints"
                        className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-6 py-4 text-center font-medium transition"
                    >
                        View Complaints
                    </a>
                </div>
            </main>
        </div>
    )
}
