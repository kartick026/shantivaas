'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) throw error

            setMessage({
                type: 'success',
                text: 'Check your email for the magic link!',
            })
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to send magic link',
            })
        } finally {
            setLoading(false)
        }
    }

    const handlePhoneLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone,
                options: {
                    channel: 'sms',
                },
            })

            if (error) throw error

            setMessage({
                type: 'success',
                text: 'Check your phone for the OTP!',
            })
            // Redirect to OTP verification page
            router.push(`/auth/verify-otp?phone=${encodeURIComponent(phone)}`)
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to send OTP',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 selection:bg-brand selection:text-black relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-[100px] -z-10"></div>

            <div className="max-w-md w-full space-y-8 bg-[#151515] p-8 rounded-3xl shadow-2xl border border-white/5 relative z-10">
                {/* Header */}
                <div className="text-center">
                    <Link href="/" className="inline-block mb-4">
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-brand shadow-[0_0_10px_var(--color-brand)]"></div>
                            <span className="font-bold text-lg tracking-tight text-white">Shantivaas</span>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                    <p className="mt-2 text-sm text-gray-400">Sign in to manage your property</p>
                </div>

                {/* Login Method Tabs */}
                <div className="flex rounded-full bg-[#222] p-1 border border-white/5">
                    <button
                        onClick={() => setLoginMethod('email')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${loginMethod === 'email'
                            ? 'bg-brand text-black shadow-lg shadow-brand/20'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Email
                    </button>
                    <button
                        onClick={() => setLoginMethod('phone')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${loginMethod === 'phone'
                            ? 'bg-brand text-black shadow-lg shadow-brand/20'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Phone (OTP)
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`p-4 rounded-xl text-center text-sm font-medium ${message.type === 'success'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Email Login Form */}
                {loginMethod === 'email' && (
                    <form onSubmit={handleEmailLogin} className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                                placeholder="admin@shantivaas.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-black bg-brand hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
                        >
                            {loading ? 'Sending Link...' : 'Send Magic Link'}
                        </button>
                    </form>
                )}

                {/* Phone Login Form */}
                {loginMethod === 'phone' && (
                    <form onSubmit={handlePhoneLogin} className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-2">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-5 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition"
                                placeholder="+919876543210"
                            />
                            <p className="mt-1 text-xs text-gray-600">Include country code (e.g., +91)</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-black bg-brand hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-gray-600 pt-4 border-t border-white/5">
                    <p>By logging in, you agree to our Terms of Service</p>
                </div>
            </div>
        </div>
    )
}
