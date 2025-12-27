'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyOTPContent() {
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const phone = searchParams.get('phone') || ''
    const supabase = createClient()

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.verifyOtp({
                phone,
                token: otp,
                type: 'sms',
            })

            if (error) throw error

            router.push('/dashboard')
        } catch (error: any) {
            setError(error.message || 'Invalid OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleResendOTP = async () => {
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone,
                options: {
                    channel: 'sms',
                },
            })

            if (error) throw error

            alert('OTP resent successfully!')
        } catch (error: any) {
            setError(error.message || 'Failed to resend OTP')
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
                    <h1 className="text-3xl font-bold text-white">Verify OTP</h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Enter the code sent to <span className="text-brand font-medium">{phone}</span>
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-center text-sm">
                        {error}
                    </div>
                )}

                {/* OTP Form */}
                <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">
                    <div>
                        <input
                            id="otp"
                            type="text"
                            required
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/10 rounded-xl text-white placeholder-gray-700 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition text-center text-3xl tracking-[0.5em] font-mono"
                            placeholder="000000"
                            autoComplete="one-time-code"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-black bg-brand hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
                    >
                        {loading ? 'Verifying...' : 'Verify & Login'}
                    </button>
                </form>

                {/* Resend OTP */}
                <div className="text-center pt-4 border-t border-white/5 space-y-4">
                    <button
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="text-sm text-brand hover:text-white transition font-medium disabled:opacity-50 underline-offset-4 hover:underline"
                    >
                        Didn't receive the code? Resend
                    </button>
                    <div>
                        <button
                            onClick={() => router.push('/login')}
                            className="text-sm text-gray-500 hover:text-white transition"
                        >
                            ← Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>}>
            <VerifyOTPContent />
        </Suspense>
    )
}
