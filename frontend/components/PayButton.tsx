'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

interface PayButtonProps {
    amount: number
    rentCycleId: string
    buttonText?: string
    className?: string
}

declare global {
    interface Window {
        Razorpay: any
    }
}

export default function PayButton({ amount, rentCycleId, buttonText = "Pay Now", className }: PayButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handlePayment = async () => {
        setLoading(true)
        try {
            // 1. Create Order
            const res = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, rentCycleId })
            })

            const orderData = await res.json()

            if (!res.ok) throw new Error(orderData.error)

            // 2. Open Razorpay Interface
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Shantivaas Rental",
                description: `Rent Payment`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await fetch('/api/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                rentCycleId,
                                amount
                            })
                        })

                        const verifyData = await verifyRes.json()

                        if (!verifyRes.ok) throw new Error(verifyData.error)

                        alert('Payment Successful!')
                        router.refresh()

                    } catch (err: any) {
                        alert('Payment verification failed: ' + err.message)
                    }
                },
                prefill: {
                    name: "Tenant Name", // Ideally passed as prop
                    email: "tenant@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#bef264" // Custom Brand Color
                }
            }

            const paymentObject = new window.Razorpay(options)
            paymentObject.open()

        } catch (error: any) {
            alert('Payment failed: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />
            <button
                onClick={handlePayment}
                disabled={loading}
                className={className || "px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"}
            >
                {loading ? 'Processing...' : buttonText}
            </button>
        </>
    )
}
