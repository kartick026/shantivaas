'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewTenantPage() {
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        full_name: '',
        room_id: '',
        individual_rent: '',
        join_date: new Date().toISOString().split('T')[0],
        emergency_contact: '',
    })
    const [rooms, setRooms] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    // Load available rooms
    useEffect(() => {
        async function loadRooms() {
            const { data } = await supabase
                .from('rooms')
                .select(`
          *,
          floors(
            floor_number,
            buildings(name)
          )
        `)
                .eq('is_active', true)
                .order('room_number')

            if (data) {
                setRooms(data)
            }
        }
        loadRooms()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. Create user in auth.users (using admin API would be ideal, but we'll guide the admin)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                phone: formData.phone,
                options: {
                    data: {
                        full_name: formData.full_name,
                    },
                },
            })

            if (authError) throw authError
            if (!authData.user) throw new Error('Failed to create user')

            // 2. Create user profile
            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    id: authData.user.id,
                    role: 'tenant',
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                })

            if (profileError) throw profileError

            // 3. Create tenant record
            const { error: tenantError } = await supabase
                .from('tenants')
                .insert({
                    user_id: authData.user.id,
                    room_id: formData.room_id || null,
                    individual_rent: parseFloat(formData.individual_rent),
                    join_date: formData.join_date,
                    emergency_contact: formData.emergency_contact,
                    is_active: true,
                })

            if (tenantError) throw tenantError

            // Redirect to tenants list
            router.push('/admin/tenants')
        } catch (err: any) {
            setError(err.message || 'Failed to create tenant')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/tenants" className="text-gray-600 hover:text-gray-900">
                            ← Back
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Add New Tenant</h1>
                    </div>
                </div>
            </header>

            {/* Form */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        id="full_name"
                                        type="text"
                                        required
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="+919876543210"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Include country code (e.g., +91)</p>
                                </div>

                                <div>
                                    <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 mb-2">
                                        Emergency Contact
                                    </label>
                                    <input
                                        id="emergency_contact"
                                        type="tel"
                                        value={formData.emergency_contact}
                                        onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="+919876543211"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Room Assignment */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Room Assignment</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="room_id" className="block text-sm font-medium text-gray-700 mb-2">
                                        Assign Room
                                    </label>
                                    <select
                                        id="room_id"
                                        value={formData.room_id}
                                        onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    >
                                        <option value="">No room assigned</option>
                                        {rooms.map((room) => (
                                            <option key={room.id} value={room.id}>
                                                Room {room.room_number} - Floor {room.floors.floor_number} ({room.floors.buildings.name})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">Can be assigned later</p>
                                </div>

                                <div>
                                    <label htmlFor="individual_rent" className="block text-sm font-medium text-gray-700 mb-2">
                                        Monthly Rent (₹) *
                                    </label>
                                    <input
                                        id="individual_rent"
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.individual_rent}
                                        onChange={(e) => setFormData({ ...formData, individual_rent: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="5000"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="join_date" className="block text-sm font-medium text-gray-700 mb-2">
                                        Join Date *
                                    </label>
                                    <input
                                        id="join_date"
                                        type="date"
                                        required
                                        value={formData.join_date}
                                        onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Tenant will receive login credentials via email/SMS</li>
                                <li>• They can login using email or phone OTP</li>
                                <li>• Rent cycles will be auto-generated from next month</li>
                                <li>• You can edit tenant details anytime</li>
                            </ul>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4">
                            <Link
                                href="/admin/tenants"
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-center"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {loading ? 'Creating...' : 'Create Tenant'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
