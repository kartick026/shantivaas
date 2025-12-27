import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BuildingsPage() {
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

    // Get all buildings with floor counts
    const { data: buildings } = await supabase
        .from('buildings')
        .select(`
      *,
      floors(id, floor_number, total_rooms)
    `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

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
                            <h1 className="text-2xl font-bold text-gray-900">Buildings & Floors</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {buildings?.length || 0} building(s)
                            </p>
                        </div>
                        <Link
                            href="/admin/buildings/new"
                            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                        >
                            + Add Building
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {buildings && buildings.length > 0 ? (
                    <div className="space-y-6">
                        {buildings.map((building: any) => (
                            <div key={building.id} className="bg-white rounded-lg shadow">
                                {/* Building Header */}
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">{building.name}</h2>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {building.address}, {building.city}, {building.state} - {building.pincode}
                                            </p>
                                            <div className="mt-2 flex gap-4 text-sm text-gray-500">
                                                <span>{building.total_floors} floors</span>
                                                <span>•</span>
                                                <span>{building.floors?.length || 0} configured</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/admin/buildings/${building.id}/floors/new`}
                                                className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition"
                                            >
                                                + Add Floor
                                            </Link>
                                            <Link
                                                href={`/admin/buildings/${building.id}/edit`}
                                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Floors List */}
                                <div className="p-6">
                                    {building.floors && building.floors.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {building.floors
                                                .sort((a: any, b: any) => a.floor_number - b.floor_number)
                                                .map((floor: any) => (
                                                    <div
                                                        key={floor.id}
                                                        className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-medium text-gray-900">
                                                                    Floor {floor.floor_number}
                                                                    {floor.floor_number === 0 && ' (Ground)'}
                                                                </h3>
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    {floor.total_rooms} room{floor.total_rooms !== 1 ? 's' : ''}
                                                                </p>
                                                            </div>
                                                            <Link
                                                                href={`/admin/rooms?floor_id=${floor.id}`}
                                                                className="text-xs text-indigo-600 hover:text-indigo-700"
                                                            >
                                                                View Rooms →
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p className="text-sm">No floors configured yet</p>
                                            <Link
                                                href={`/admin/buildings/${building.id}/floors/new`}
                                                className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
                                            >
                                                Add first floor →
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow text-center py-12">
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
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No buildings</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding your first building.</p>
                        <div className="mt-6">
                            <Link
                                href="/admin/buildings/new"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                + Add Building
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
