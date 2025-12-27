import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function TenantsPage() {
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

    // Get all tenants with related data
    const { data: tenants } = await supabase
        .from('tenants')
        .select(`
      *,
      user_profiles!inner(full_name, email, phone),
      rooms(
        room_number,
        floors(
          floor_number,
          buildings(name)
        )
      )
    `)
        .order('created_at', { ascending: false })

    // Get active tenant count
    const activeTenants = tenants?.filter(t => t.is_active) || []
    const inactiveTenants = tenants?.filter(t => !t.is_active) || []

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
                            <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {activeTenants.length} active • {inactiveTenants.length} inactive
                            </p>
                        </div>
                        <Link
                            href="/admin/tenants/new"
                            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                        >
                            + Add Tenant
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm font-medium text-gray-500">Total Tenants</div>
                        <div className="mt-2 text-3xl font-bold text-gray-900">
                            {tenants?.length || 0}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm font-medium text-gray-500">Active Tenants</div>
                        <div className="mt-2 text-3xl font-bold text-green-600">
                            {activeTenants.length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm font-medium text-gray-500">Total Rent/Month</div>
                        <div className="mt-2 text-3xl font-bold text-gray-900">
                            {formatCurrency(
                                activeTenants.reduce((sum, t) => sum + t.individual_rent, 0)
                            )}
                        </div>
                    </div>
                </div>

                {/* Tenants Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">All Tenants</h2>
                    </div>

                    {tenants && tenants.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tenant
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Room
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rent
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Join Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {tenants.map((tenant: any) => (
                                        <tr key={tenant.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {tenant.user_profiles.full_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {tenant.user_profiles.email}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {tenant.user_profiles.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {tenant.rooms ? (
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            Room {tenant.rooms.room_number}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Floor {tenant.rooms.floors.floor_number} • {tenant.rooms.floors.buildings.name}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">No room assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(tenant.individual_rent)}
                                                </div>
                                                <div className="text-sm text-gray-500">per month</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(tenant.join_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${tenant.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {tenant.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/tenants/${tenant.id}/edit`}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={`/admin/tenants/${tenant.id}`}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    View
                                                </Link>
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
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by adding a new tenant.</p>
                            <div className="mt-6">
                                <Link
                                    href="/admin/tenants/new"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    + Add Tenant
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
