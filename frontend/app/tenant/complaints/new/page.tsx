'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, AlertCircle, Info } from 'lucide-react'

export default function NewComplaintPage() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'maintenance',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Get tenant record
            const { data: tenant } = await supabase
                .from('tenants')
                .select('id, room_id')
                .eq('user_id', user.id)
                .single()

            if (!tenant) throw new Error('Tenant record not found')

            // Create complaint
            const { error: insertError } = await supabase
                .from('complaints')
                .insert({
                    tenant_id: tenant.id,
                    room_id: tenant.room_id!,
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    priority: formData.priority,
                })

            if (insertError) throw insertError

            // Redirect to dashboard
            router.push('/tenant/dashboard')
        } catch (err: any) {
            setError(err.message || 'Failed to submit complaint')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
            {/* Header */}
            <header className="bg-[#111] border-b border-zinc-900 sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" /> Back
                        </button>
                        <h1 className="text-xl font-bold text-white tracking-tight">Submit Complaint</h1>
                    </div>
                </div>
            </header>

            {/* Form */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-[#151515] rounded-xl border border-zinc-800 p-6 shadow-xl relative overflow-hidden">

                    {/* Glowing effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#bef264] opacity-5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-zinc-400 mb-2">
                                Complaint Title *
                            </label>
                            <input
                                id="title"
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors placeholder-zinc-600"
                                placeholder="e.g., Leaking tap in bathroom"
                            />
                        </div>

                        {/* Category & Priority Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-zinc-400 mb-2">
                                    Category *
                                </label>
                                <select
                                    id="category"
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors appearance-none"
                                >
                                    <option value="plumbing">Plumbing</option>
                                    <option value="electrical">Electrical</option>
                                    <option value="cleaning">Cleaning</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="noise">Noise</option>
                                    <option value="security">Security</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-zinc-400 mb-2">
                                    Priority
                                </label>
                                <select
                                    id="priority"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors appearance-none"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-zinc-400 mb-2">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={6}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bef264] focus:ring-1 focus:ring-[#bef264] transition-colors resize-none placeholder-zinc-600"
                                placeholder="Please describe the issue in detail..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 border border-zinc-700 rounded-lg text-zinc-300 font-medium hover:bg-zinc-800 hover:text-white transition text-center"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-[#bef264] text-black rounded-lg font-bold hover:bg-[#a3d929] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                {loading ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Complaint</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-[#bef264]/5 border border-[#bef264]/10 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#bef264] mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-bold text-[#bef264] mb-2">What happens next?</h3>
                        <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
                            <li>Your complaint will be reviewed by the admin</li>
                            <li>You'll receive updates via notifications (Coming soon)</li>
                            <li><strong className="text-zinc-300">Urgent</strong> issues are prioritized immediately</li>
                            <li>Average response time: 24-48 hours</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    )
}
