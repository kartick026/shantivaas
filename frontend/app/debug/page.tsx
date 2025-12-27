'use client'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export default function DebugPage() {
    const [status, setStatus] = useState('Checking...')
    const [details, setDetails] = useState('')

    useEffect(() => {
        async function check() {
            try {
                const supabase = createClient()
                // Try a simple health check query (fetching 0 rows)
                const { data, error } = await supabase.from('user_profiles').select('id').limit(1)

                if (error) {
                    setDetails(JSON.stringify(error, null, 2))
                    throw error
                }
                setStatus('Connection Successful! Database is reachable.')
            } catch (e: any) {
                setStatus('Connection Failed')
                setDetails(e.message)
            }
        }
        check()
    }, [])

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const urlStatus = supabaseUrl 
        ? (supabaseUrl.includes('your-project-ref') || supabaseUrl.includes('placeholder') ? '⚠️ Placeholder Value' : '✅ Valid')
        : '❌ Missing'

    return (
        <div className="p-8 text-black bg-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Debug Supabase Connection</h1>
            <div className="space-y-4">
                <div className="p-4 bg-gray-100 rounded">
                    <strong>NEXT_PUBLIC_SUPABASE_URL:</strong><br />
                    <code className="text-sm">{supabaseUrl || 'UNDEFINED'}</code>
                    <div className="mt-2 text-sm">{urlStatus}</div>
                </div>
                <div className="p-4 bg-gray-100 rounded">
                    <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong><br />
                    {hasAnonKey ? (
                        <span className="text-green-600">✅ Set (hidden for security)</span>
                    ) : (
                        <span className="text-red-600">❌ Missing</span>
                    )}
                </div>
                <div className={`p-4 rounded ${status.includes('Success') ? 'bg-green-100' : 'bg-red-100'}`}>
                    <strong>Connection Status:</strong> {status}
                </div>
                {details && (
                    <div className="p-4 bg-gray-800 text-white rounded overflow-auto">
                        <strong>Error Details:</strong>
                        <pre className="mt-2">{details}</pre>
                    </div>
                )}
                <div className="p-4 bg-blue-50 rounded border border-blue-200">
                    <strong>💡 Tips:</strong>
                    <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                        <li>If URL shows "UNDEFINED", check your <code>.env.local</code> file</li>
                        <li>If URL contains "your-project-ref", update it with real Supabase URL</li>
                        <li>If connection fails, check Supabase project is not paused</li>
                        <li>Restart dev server after changing <code>.env.local</code></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
