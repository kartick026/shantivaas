import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Plus, Users, UserCheck, Banknote, MoreHorizontal } from 'lucide-react'

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
    // Using left join so we don't lose data if user_profiles is missing
    const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select(`
      *,
      photo_url,
      user_profiles(full_name, email, phone),
      rooms(
        room_number,
        floors(
          floor_number,
          buildings(name)
        )
      )
    `)
        .order('created_at', { ascending: false })

    if (tenantsError) {
        console.error('Error fetching tenants:', tenantsError)
    }

    // Get active tenant count
    const activeTenants = tenants?.filter(t => t.is_active) || []
    const inactiveTenants = tenants?.filter(t => !t.is_active) || []

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
                            <h1 className="text-2xl font-bold text-white tracking-tight">Tenant Management</h1>
                            <p className="text-sm text-zinc-500 mt-1">
                                {activeTenants.length} active • {inactiveTenants.length} inactive
                            </p>
                        </div>
                        <Link
                            href="/admin/tenants/new"
                            className="px-4 py-2 bg-[#bef264] text-black font-bold rounded-lg hover:bg-[#a3d929] transition transform active:scale-95 flex items-center gap-2 shadow-[0_0_15px_rgba(190,242,100,0.1)]"
                        >
                            <Plus className="w-4 h-4" /> Add Tenant
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-6 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-zinc-400">Total Tenants</div>
                            <div className="mt-2 text-3xl font-bold text-white tracking-tight">
                                {tenants?.length || 0}
                            </div>
                        </div>
                        <div className="p-3 bg-zinc-900 rounded-lg">
                            <Users className="w-6 h-6 text-zinc-400" />
                        </div>
                    </div>
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-6 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-zinc-400">Active Tenants</div>
                            <div className="mt-2 text-3xl font-bold text-[#bef264] tracking-tight">
                                {activeTenants.length}
                            </div>
                        </div>
                        <div className="p-3 bg-zinc-900 rounded-lg">
                            <UserCheck className="w-6 h-6 text-[#bef264]" />
                        </div>
                    </div>
                    <div className="bg-[#151515] rounded-xl border border-zinc-800 p-6 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-zinc-400">Total Rent/Month</div>
                            <div className="mt-2 text-3xl font-bold text-white tracking-tight">
                                {formatCurrency(
                                    activeTenants.reduce((sum, t) => sum + t.individual_rent, 0)
                                )}
                            </div>
                        </div>
                        <div className="p-3 bg-zinc-900 rounded-lg">
                            <Banknote className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Tenants Table */}
                <div className="bg-[#151515] rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-[#1a1a1a]">
                        <h2 className="text-lg font-semibold text-white">All Tenants</h2>
                    </div>

                    {tenants && tenants.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-800/50">
                                <thead className="bg-[#111]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Tenant
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Room
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Rent
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                            Join Date
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
                                    {tenants.map((tenant: any) => (
                                        <tr key={tenant.id} className="hover:bg-zinc-800/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {tenant.photo_url ? (
                                                            <img className="h-10 w-10 rounded-full object-cover border border-zinc-700" src={tenant.photo_url} alt="" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold">
                                                                {tenant.user_profiles?.full_name?.charAt(0) || '?'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-white group-hover:text-[#bef264] transition-colors">
                                                            {tenant.user_profiles?.full_name || 'Unknown'}
                                                        </div>
                                                        <div className="text-xs text-zinc-500">
                                                            {tenant.user_profiles?.phone || tenant.user_profiles?.email || 'No contact'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {tenant.rooms ? (
                                                    <div>
                                                        <div className="text-sm font-medium text-zinc-200">
                                                            Room {tenant.rooms.room_number}
                                                        </div>
                                                        <div className="text-xs text-zinc-500">
                                                            Floor {tenant.rooms.floors.floor_number} • {tenant.rooms.floors.buildings.name}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-zinc-600 italic">No room assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-zinc-200">
                                                    {formatCurrency(tenant.individual_rent)}
                                                </div>
                                                <div className="text-xs text-zinc-500">per month</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                                                {formatDate(tenant.join_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold uppercase tracking-wide rounded border ${tenant.is_active
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                        : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                                        }`}
                                                >
                                                    {tenant.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        href={`/admin/tenants/${tenant.id}/edit`}
                                                        className="text-zinc-400 hover:text-[#bef264] transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button className="text-zinc-600 hover:text-white transition-colors">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 flex flex-col items-center">
                            <Users className="w-12 h-12 text-zinc-700 mb-4" />
                            <h3 className="text-lg font-medium text-white">No tenants found</h3>
                            <p className="mt-1 text-sm text-zinc-500">Get started by onboarding a new tenant.</p>
                            <div className="mt-6">
                                <Link
                                    href="/admin/tenants/new"
                                    className="inline-flex items-center px-4 py-2 bg-[#bef264] text-black font-bold rounded-lg hover:bg-[#a3d929] transition"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Tenant
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
