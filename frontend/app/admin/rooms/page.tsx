import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function RoomsPage() {
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

    // Get room status view data
    const { data: rooms } = await supabase
        .from('room_status')
        .select('*')
        .order('building_name')
        .order('floor_number')
        .order('room_number')

    // Calculate stats
    const totalRooms = rooms?.length || 0
    const vacantRooms = rooms?.filter(r => r.occupancy_status === 'vacant').length || 0
    const fullRooms = rooms?.filter(r => r.occupancy_status === 'full').length || 0
    const partialRooms = rooms?.filter(r => r.occupancy_status === 'partial').length || 0

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <Link href="/admin/dashboard" className="text-indigo-600 hover:text-indigo-700 text-sm mb-2 inline-block">
                                ← Back to Dashboard
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {totalRooms} total rooms • {vacantRooms} vacant • {fullRooms} full
                            </p>
                        </div>
                        <Link
                            href="/admin/rooms/new"
                            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                        >
                            + Add Room
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm font-medium text-gray-500">Total Rooms</div>
                        <div className="mt-2 text-3xl font-bold text-gray-900">{totalRooms}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm font-medium text-gray-500">Vacant</div>
                        <div className="mt-2 text-3xl font-bold text-gray-600">{vacantRooms}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm font-medium text-gray-500">Partially Occupied</div>
                        <div className="mt-2 text-3xl font-bold text-yellow-600">{partialRooms}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm font-medium text-gray-500">Full</div>
                        <div className="mt-2 text-3xl font-bold text-green-600">{fullRooms}</div>
                    </div>
                </div>

                {/* Rooms Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">All Rooms</h2>
                    </div>

                    {rooms && rooms.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Room
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Capacity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Occupancy
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rent
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Collection
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rooms.map((room: any) => (
                                        <tr key={room.room_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    Room {room.room_number}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">Floor {room.floor_number}</div>
                                                <div className="text-sm text-gray-500">{room.building_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {room.current_tenants} / {room.capacity}
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div
                                                        className={`h-2 rounded-full ${room.occupancy_status === 'full'
                                                                ? 'bg-green-600'
                                                                : room.occupancy_status === 'partial'
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-gray-300'
                                                            }`}
                                                        style={{
                                                            width: `${((room.current_tenants || 0) / (room.capacity || 1)) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(room.total_room_rent || 0)}
                                                </div>
                                                <div className="text-sm text-gray-500">total</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatCurrency(room.total_individual_rent || 0)}
                                                </div>
                                                {room.rent_difference !== 0 && (
                                                    <div
                                                        className={`text-xs ${(room.rent_difference || 0) < 0 ? 'text-red-600' : 'text-green-600'
                                                            }`}
                                                    >
                                                        {(room.rent_difference || 0) < 0 ? '-' : '+'}
                                                        {formatCurrency(Math.abs(room.rent_difference || 0))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${room.occupancy_status === 'full'
                                                            ? 'bg-green-100 text-green-800'
                                                            : room.occupancy_status === 'partial'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {room.occupancy_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No rooms</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by adding a new room.</p>
                            <div className="mt-6">
                                <Link
                                    href="/admin/rooms/new"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    + Add Room
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
