'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Building2, Home, Users, Banknote, AlertCircle } from 'lucide-react'

export default function EditRoomPage() {
    const params = useParams()
    const roomId = params?.id as string
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        room_number: '',
        floor_id: '',
        capacity: 1,
        monthly_rent: '',
        description: '',
        is_active: true
    })
    const [buildings, setBuildings] = useState<any[]>([])
    const [selectedBuilding, setSelectedBuilding] = useState('')
    const [floors, setFloors] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    // Load room data and buildings/floors
    useEffect(() => {
        async function loadData() {
            try {
                // Load room data via API
                const response = await fetch(`/api/admin/rooms/${roomId}`)
                const roomData = await response.json()

                if (!response.ok) {
                    throw new Error(roomData.error || 'Failed to load room data')
                }

                if (!roomData) {
                    throw new Error('Room not found')
                }

                // Populate form with existing data
                setFormData({
                    room_number: roomData.room_number || '',
                    floor_id: roomData.floor_id || '',
                    capacity: roomData.capacity || 1,
                    monthly_rent: roomData.monthly_rent?.toString() || '',
                    description: roomData.description || '',
                    is_active: roomData.is_active ?? true
                })

                // Set selected building from room's floor
                if (roomData.floor_id && roomData.floors) {
                    const buildingId = roomData.floors.building_id
                    setSelectedBuilding(buildingId)
                }

                // Load all buildings
                const { data: buildingsData } = await supabase
                    .from('buildings')
                    .select('id, name, floors(id, floor_number)')
                    .eq('is_active', true)
                    .order('name')

                if (buildingsData) {
                    setBuildings(buildingsData)
                    
                    // Update floors based on selected building
                    if (selectedBuilding || roomData.floors?.building_id) {
                        const buildingId = selectedBuilding || roomData.floors?.building_id
                        const building = buildingsData.find(b => b.id === buildingId)
                        if (building && building.floors) {
                            const sortedFloors = [...building.floors].sort((a, b) => a.floor_number - b.floor_number)
                            setFloors(sortedFloors)
                        }
                    }
                }
            } catch (err: any) {
                console.error('Error loading room:', err)
                setError(err.message || 'Failed to load room data')
            } finally {
                setPageLoading(false)
            }
        }

        if (roomId) {
            loadData()
        }
    }, [roomId])

    // Update floors when building changes
    useEffect(() => {
        if (selectedBuilding) {
            const building = buildings.find(b => b.id === selectedBuilding)
            if (building && building.floors) {
                const sortedFloors = [...building.floors].sort((a, b) => a.floor_number - b.floor_number)
                setFloors(sortedFloors)
                
                // If current floor_id is not in new floors, clear it
                if (formData.floor_id && !sortedFloors.find(f => f.id === formData.floor_id)) {
                    if (sortedFloors.length > 0) {
                        setFormData(prev => ({ ...prev, floor_id: sortedFloors[0].id }))
                    } else {
                        setFormData(prev => ({ ...prev, floor_id: '' }))
                    }
                }
            }
        }
    }, [selectedBuilding, buildings])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            if (!formData.floor_id) {
                throw new Error('Please select a floor')
            }

            const response = await fetch(`/api/admin/rooms/${roomId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_number: formData.room_number,
                    floor_id: formData.floor_id,
                    capacity: parseInt(formData.capacity.toString()),
                    monthly_rent: parseFloat(formData.monthly_rent),
                    description: formData.description || null,
                    is_active: formData.is_active
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update room')
            }

            router.push('/admin/rooms')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Failed to update room')
        } finally {
            setSaving(false)
        }
    }

    const rentPerPerson = formData.monthly_rent && formData.capacity > 0
        ? parseFloat(formData.monthly_rent) / parseInt(formData.capacity.toString())
        : 0

    if (pageLoading) {
        return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-zinc-500">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
            {/* Header */}
            <header className="bg-[#111] border-b border-zinc-900 sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/rooms" className="text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold text-white">Edit Room</h1>
                    </div>
                </div>
            </header>

            {/* Form */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-[#151515] rounded-xl border border-zinc-800 p-6 shadow-xl">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Location Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                                <Building2 className="w-5 h-5 text-[#bef264]" /> Location Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Building</label>
                                    <select
                                        value={selectedBuilding}
                                        onChange={(e) => setSelectedBuilding(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors"
                                    >
                                        <option value="">Select Building</option>
                                        {buildings.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Floor</label>
                                    <select
                                        value={formData.floor_id}
                                        onChange={(e) => setFormData({ ...formData, floor_id: e.target.value })}
                                        disabled={!selectedBuilding}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select Floor</option>
                                        {floors.map(f => (
                                            <option key={f.id} value={f.id}>Floor {f.floor_number}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Room Details Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                                <Home className="w-5 h-5 text-blue-400" /> Room Configuration
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Room Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.room_number}
                                        onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                        placeholder="e.g. 101, A1"
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors placeholder-zinc-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Capacity (Beds)</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Additional details about the room..."
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors resize-none placeholder-zinc-600"
                                />
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                                <Banknote className="w-5 h-5 text-green-400" /> Pricing
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Total Monthly Rent (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-zinc-500">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={formData.monthly_rent}
                                        onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-8 pr-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-zinc-500">
                                    The total amount to be collected for the entire room.
                                </p>
                            </div>

                            {rentPerPerson > 0 && (
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex justify-between items-center">
                                    <span className="text-sm text-zinc-400">Estimated rent per person:</span>
                                    <span className="text-lg font-bold text-[#bef264]">₹{rentPerPerson.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                </div>
                            )}
                        </div>

                        {/* Status Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                                Status
                            </h3>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-[#bef264] focus:ring-[#bef264] focus:ring-offset-0"
                                />
                                <span className="text-sm font-medium text-zinc-300">Active Room</span>
                            </label>
                            <p className="text-xs text-zinc-500 ml-8">Uncheck to deactivate this room (will hide from tenant assignments)</p>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex gap-4">
                            <Link
                                href="/admin/rooms"
                                className="flex-1 px-6 py-3 border border-zinc-700 rounded-lg text-zinc-300 font-medium hover:bg-zinc-800 hover:text-white transition text-center"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-[#bef264] text-black rounded-lg font-bold hover:bg-[#a3d929] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

