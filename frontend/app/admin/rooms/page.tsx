import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Plus, DoorOpen, Users, AlertCircle, CheckCircle, MoreHorizontal } from 'lucide-react'

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
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
            {/* Header */}
            <header className="bg-[#111] border-b border-zinc-900 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <Link href="/admin/dashboard" className="text-zinc-400 hover:text-white text-sm mb-2 inline-flex items-center gap-1 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                            </Link>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Room Management</h1>
                            <p className="text-sm text-zinc-500 mt-1">
                                {totalRooms} total rooms • {vacantRooms} vacant • {fullRooms} full
                            </p>
                        </div>
                        <Link
                            href="/admin/rooms/new"
                            className="px-4 py-2 bg-[#bef264] text-black font-bold rounded-lg hover:bg-[#a3d929] transition transform active:scale-95 flex items-center gap-2 shadow-[0_0_15px_rgba(190,242,100,0.1)]"
                        >
                            <Plus className="w-4 h-4" /> Add Room
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <DoorOpen className="w-12 h-12 text-zinc-400" />
                        </div>
                        <div className="text-sm font-medium text-zinc-400">Total Rooms</div>
                        <div className="mt-1 text-3xl font-bold text-white tracking-tight">{totalRooms}</div>
                    </div>
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CheckCircle className="w-12 h-12 text-zinc-400" />
                        </div>
                        <div className="text-sm font-medium text-zinc-400">Vacant</div>
                        <div className="mt-1 text-3xl font-bold text-zinc-200 tracking-tight">{vacantRooms}</div>
                    </div>
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Users className="w-12 h-12 text-yellow-500" />
                        </div>
                        <div className="text-sm font-medium text-zinc-400">Partially Occupied</div>
                        <div className="mt-1 text-3xl font-bold text-yellow-400 tracking-tight">{partialRooms}</div>
                    </div>
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Users className="w-12 h-12 text-green-500" />
                        </div>
                        <div className="text-sm font-medium text-zinc-400">Full</div>
                        <div className="mt-1 text-3xl font-bold text-green-400 tracking-tight">{fullRooms}</div>
                    </div>
                </div>

                {/* Rooms Table */}
                <div className="bg-[#151515] rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-[#1a1a1a]">
                        <h2 className="text-lg font-semibold text-white">All Rooms</h2>
                    </div>

                    {rooms && rooms.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-800/50">
                                <thead className="bg-[#111]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Room
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Capacity & Occupancy
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Rent
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Collection
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#151515] divide-y divide-zinc-800">
                                    {rooms.map((room: any) => (
                                        <tr key={room.room_id} className="hover:bg-zinc-800/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-white group-hover:text-[#bef264] transition-colors">
                                                    Room {room.room_number}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-zinc-300">Floor {room.floor_number}</div>
                                                <div className="text-xs text-zinc-500">{room.building_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm text-zinc-300">
                                                        {room.current_tenants} / {room.capacity}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        ({room.capacity === 1 ? 'Single' : 'Shared'})
                                                    </span>
                                                </div>
                                                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-1.5 rounded-full transition-all ${room.occupancy_status === 'full'
                                                            ? 'bg-green-500'
                                                            : room.occupancy_status === 'partial'
                                                                ? 'bg-yellow-500'
                                                                : 'bg-zinc-600'
                                                            }`}
                                                        style={{
                                                            width: `${((room.current_tenants || 0) / (room.capacity || 1)) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-zinc-200">
                                                    {formatCurrency(room.total_room_rent || 0)}
                                                </div>
                                                <div className="text-xs text-zinc-500">per month</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-zinc-300">
                                                    {formatCurrency(room.total_individual_rent || 0)}
                                                </div>
                                                {room.rent_difference !== 0 && (
                                                    <div
                                                        className={`text-xs ${(room.rent_difference || 0) < 0 ? 'text-red-400' : 'text-green-400'
                                                            }`}
                                                    >
                                                        {(room.rent_difference || 0) < 0 ? '-' : '+'}
                                                        {formatCurrency(Math.abs(room.rent_difference || 0))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold uppercase tracking-wide rounded border ${room.occupancy_status === 'full'
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                        : room.occupancy_status === 'partial'
                                                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                                        }`}
                                                >
                                                    {room.occupancy_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/rooms/${room.room_id}/edit`}
                                                    className="text-zinc-400 hover:text-[#bef264] transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 flex flex-col items-center">
                            <DoorOpen className="w-12 h-12 text-zinc-700 mb-4" />
                            <h3 className="text-lg font-medium text-white">No rooms found</h3>
                            <p className="mt-1 text-sm text-zinc-500">Get started by creating your first room.</p>
                            <div className="mt-6">
                                <Link
                                    href="/admin/rooms/new"
                                    className="inline-flex items-center px-4 py-2 bg-[#bef264] text-black font-bold rounded-lg hover:bg-[#a3d929] transition"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Room
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
