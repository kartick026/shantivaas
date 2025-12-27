'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Phone, Mail, Building2, Calendar, AlertCircle, Save, IndianRupee, FileText, Upload, Image as ImageIcon, MapPin, X } from 'lucide-react'

export default function EditTenantPage() {
    const params = useParams()
    const tenantId = params?.id as string
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        full_name: '',
        room_id: '',
        individual_rent: '',
        join_date: '',
        leave_date: '',
        emergency_contact: '',
        is_active: true,
        id_proof_url: '',
        address_proof_url: '',
        photo_url: ''
    })

    const [fileStatus, setFileStatus] = useState({
        aadhar: { uploading: false, error: null as string | null, success: false },
        address: { uploading: false, error: null as string | null, success: false },
        photo: { uploading: false, error: null as string | null, success: false }
    })

    const [rooms, setRooms] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    // Load tenant data and rooms
    useEffect(() => {
        async function loadData() {
            try {
                // Load tenant data via API route (uses admin client, bypasses RLS)
                const response = await fetch(`/api/admin/tenants/${tenantId}`)
                const tenantData = await response.json()

                if (!response.ok) {
                    throw new Error(tenantData.error || 'Failed to load tenant')
                }

                if (!tenantData) {
                    throw new Error('Tenant not found')
                }

                const tenant = tenantData

                // Populate form with existing data
                setFormData({
                    email: tenant.user_profiles?.email || '',
                    phone: tenant.user_profiles?.phone || '',
                    full_name: tenant.user_profiles?.full_name || '',
                    room_id: tenant.room_id || '',
                    individual_rent: tenant.individual_rent?.toString() || '',
                    join_date: tenant.join_date || '',
                    leave_date: tenant.leave_date || '',
                    emergency_contact: tenant.emergency_contact || '',
                    is_active: tenant.is_active ?? true,
                    id_proof_url: tenant.id_proof_url || '',
                    address_proof_url: tenant.address_proof_url || '',
                    photo_url: tenant.photo_url || ''
                })

                // Load available rooms (client-side query should work for rooms)
                const { data: roomsData, error: roomsError } = await supabase
                    .from('rooms')
                    .select(`
                        id,
                        room_number,
                        monthly_rent,
                        floors(
                            floor_number,
                            buildings(name)
                        )
                    `)
                    .eq('is_active', true)
                    .order('room_number')

                if (roomsError) {
                    console.warn('Error loading rooms:', roomsError)
                }

                if (roomsData) {
                    setRooms(roomsData)
                }
            } catch (err: any) {
                console.error('Error loading tenant:', err)
                setError(err.message || 'Failed to load tenant data')
            } finally {
                setPageLoading(false)
            }
        }

        if (tenantId) {
            loadData()
        }
    }, [tenantId])

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'aadhar' | 'address' | 'photo') => {
        const file = event.target.files?.[0]
        if (!file) return

        setFileStatus(prev => ({ ...prev, [type]: { uploading: true, error: null, success: false } }))

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${type}_${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('tenant-documents')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('tenant-documents')
                .getPublicUrl(filePath)

            // Update form data with URL
            const urlField = type === 'aadhar' ? 'id_proof_url' : type === 'address' ? 'address_proof_url' : 'photo_url'
            setFormData(prev => ({ ...prev, [urlField]: publicUrl }))

            setFileStatus(prev => ({ ...prev, [type]: { uploading: false, error: null, success: true } }))
        } catch (err: any) {
            console.error('Upload failed:', err)
            setFileStatus(prev => ({ ...prev, [type]: { uploading: false, error: 'Upload failed', success: false } }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            const response = await fetch(`/api/admin/tenants/${tenantId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update tenant')
            }

            // Redirect to tenants list
            router.push('/admin/tenants')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Failed to update tenant')
        } finally {
            setSaving(false)
        }
    }

    if (pageLoading) {
        return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-zinc-500">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
            {/* Header */}
            <header className="bg-[#111] border-b border-zinc-900 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/tenants" className="text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold text-white">Edit Tenant</h1>
                    </div>
                </div>
            </header>

            {/* Form */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-[#151515] rounded-xl border border-zinc-800 p-6 shadow-xl relative overflow-hidden">

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* 1. Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                                <User className="w-5 h-5 text-[#bef264]" /> Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label htmlFor="full_name" className="block text-sm font-medium text-zinc-400 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                                        <input
                                            id="full_name"
                                            type="text"
                                            required
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors"
                                            placeholder="e.g. Rahul Sharma"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors"
                                            placeholder="rahul@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-zinc-400 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                                        <input
                                            id="phone"
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="emergency_contact" className="block text-sm font-medium text-zinc-400 mb-2">
                                        Emergency Contact
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                                        <input
                                            id="emergency_contact"
                                            type="tel"
                                            value={formData.emergency_contact}
                                            onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors"
                                            placeholder="Parent/Guardian Number"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Documents Upload */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                                <FileText className="w-5 h-5 text-purple-400" /> Documents & Verification
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Photo Upload */}
                                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition">
                                    <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-[#bef264]" /> Tenant Photo
                                    </label>
                                    <div className="flex flex-col items-center gap-2">
                                        {formData.photo_url ? (
                                            <div className="relative w-full h-32 bg-black rounded-lg overflow-hidden border border-zinc-700">
                                                <img src={formData.photo_url} alt="Photo" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setFormData(p => ({ ...p, photo_url: '' }))} 
                                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs hover:bg-red-700"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-[#bef264] hover:bg-zinc-800/50 transition">
                                                <Upload className="w-6 h-6 text-zinc-500 mb-1" />
                                                <span className="text-xs text-zinc-500">Upload Photo</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'photo')} />
                                            </label>
                                        )}
                                        {fileStatus.photo.uploading && <span className="text-xs text-[#bef264]">Uploading...</span>}
                                    </div>
                                </div>

                                {/* Aadhar Upload */}
                                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition">
                                    <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-400" /> Aadhar Card
                                    </label>
                                    <div className="flex flex-col items-center gap-2">
                                        {formData.id_proof_url ? (
                                            <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 px-3 py-2 rounded-lg w-full">
                                                <FileText className="w-4 h-4" /> Uploaded
                                                <button 
                                                    type="button" 
                                                    onClick={() => setFormData(p => ({ ...p, id_proof_url: '' }))} 
                                                    className="ml-auto text-red-400 hover:text-red-300"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-zinc-800/50 transition">
                                                <Upload className="w-6 h-6 text-zinc-500 mb-1" />
                                                <span className="text-xs text-zinc-500">Upload Aadhar</span>
                                                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileUpload(e, 'aadhar')} />
                                            </label>
                                        )}
                                        {fileStatus.aadhar.uploading && <span className="text-xs text-blue-400">Uploading...</span>}
                                    </div>
                                </div>

                                {/* Address Proof Upload */}
                                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition">
                                    <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-400" /> Address Proof
                                    </label>
                                    <div className="flex flex-col items-center gap-2">
                                        {formData.address_proof_url ? (
                                            <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 px-3 py-2 rounded-lg w-full">
                                                <FileText className="w-4 h-4" /> Uploaded
                                                <button 
                                                    type="button" 
                                                    onClick={() => setFormData(p => ({ ...p, address_proof_url: '' }))} 
                                                    className="ml-auto text-red-400 hover:text-red-300"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-red-400 hover:bg-zinc-800/50 transition">
                                                <Upload className="w-6 h-6 text-zinc-500 mb-1" />
                                                <span className="text-xs text-zinc-500">Upload Address</span>
                                                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileUpload(e, 'address')} />
                                            </label>
                                        )}
                                        {fileStatus.address.uploading && <span className="text-xs text-red-400">Uploading...</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Room Assignment */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                                <Building2 className="w-5 h-5 text-blue-400" /> Room & Rent
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="room_id" className="block text-sm font-medium text-zinc-400 mb-2">
                                        Assign Room
                                    </label>
                                    <select
                                        id="room_id"
                                        value={formData.room_id}
                                        onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors"
                                    >
                                        <option value="">No room assigned</option>
                                        {rooms.map((room) => (
                                            <option key={room.id} value={room.id}>
                                                Room {room.room_number} - {room.floors?.buildings?.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="individual_rent" className="block text-sm font-medium text-zinc-400 mb-2">
                                        Monthly Rent (₹)
                                    </label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                                        <input
                                            id="individual_rent"
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.individual_rent}
                                            onChange={(e) => setFormData({ ...formData, individual_rent: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors"
                                            placeholder="e.g. 5000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="join_date" className="block text-sm font-medium text-zinc-400 mb-2">
                                        Join Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                                        <input
                                            id="join_date"
                                            type="date"
                                            required
                                            value={formData.join_date}
                                            onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors scheme-dark"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="leave_date" className="block text-sm font-medium text-zinc-400 mb-2">
                                        Leave Date (Optional)
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-zinc-600" />
                                        <input
                                            id="leave_date"
                                            type="date"
                                            value={formData.leave_date}
                                            onChange={(e) => setFormData({ ...formData, leave_date: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors scheme-dark"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-[#bef264] focus:ring-[#bef264] focus:ring-offset-0"
                                        />
                                        <span className="text-sm font-medium text-zinc-300">Active Tenant</span>
                                    </label>
                                    <p className="text-xs text-zinc-500 mt-1 ml-8">Uncheck to mark tenant as inactive</p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Link
                                href="/admin/tenants"
                                className="flex-1 px-6 py-3 border border-zinc-700 rounded-lg text-zinc-300 font-medium hover:bg-zinc-800 hover:text-white transition text-center"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={saving || Object.values(fileStatus).some(f => f.uploading)}
                                className="flex-1 px-6 py-3 bg-[#bef264] text-black rounded-lg font-bold hover:bg-[#a3d929] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                {saving ? 'Saving Changes...' : <><Save className="w-4 h-4" /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

