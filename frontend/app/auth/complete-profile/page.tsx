'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CompleteProfilePage() {
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [role, setRole] = useState('tenant')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user found')

            const { error } = await supabase.from('user_profiles').insert({
                id: user.id,
                email: user.email!,
                full_name: fullName,
                phone: phone,
                role: role as 'admin' | 'tenant'
            })

            if (error) {
                // If policy issues, standard error
                throw error
            }

            router.push('/dashboard')
            router.refresh()
        } catch (error: any) {
            alert('Error creating profile: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl">
                <h1 className="text-3xl font-bold mb-2 text-[#bef264]">Almost There!</h1>
                <p className="text-gray-400 mb-8">Please complete your profile to continue.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#bef264] focus:border-transparent transition-all placeholder-gray-500"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Phone Number</label>
                        <input
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#bef264] focus:border-transparent transition-all placeholder-gray-500"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">I am a...</label>
                        <select
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#bef264] focus:border-transparent transition-all"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="tenant">Tenant</option>
                            <option value="admin">Admin / Property Manager</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                            {role === 'admin' ? 'You will manage properties, tenants, and payments.' : 'You will view your rent, payments, and raise complaints.'}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#bef264] text-black font-bold p-3 rounded-lg hover:bg-[#a3d929] transition disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Creating Profile...' : 'Get Started'}
                    </button>

                    {loading && (
                        <p className="text-xs text-center text-gray-500">
                            First time setup may take a few seconds...
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
