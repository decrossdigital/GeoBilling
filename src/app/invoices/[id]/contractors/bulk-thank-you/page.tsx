'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

export default function BulkContractorThankYouPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string

  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (countdown === 0) {
      router.push(`/invoices/${invoiceId}`)
    }
  }, [countdown, router, invoiceId])

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0f172a 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '0.75rem',
        padding: '2rem',
        width: '90%',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <CheckCircle style={{height: '3rem', width: '3rem', color: '#10b981', margin: '0 auto 1.5rem auto'}} />
        <h2 style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>
          Thank You for Your Payment!
        </h2>
        <p style={{color: '#cbd5e1', marginBottom: '2rem'}}>
          Your contractor fee payments have been successfully processed. We appreciate your prompt payment.
        </p>
        <p style={{color: '#cbd5e1', fontSize: '0.875rem'}}>
          You will be redirected to the invoice details page in {countdown} seconds.
        </p>
        <button
          onClick={() => router.push(`/invoices/${invoiceId}`)}
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(to right, #10b981, #14b8a6)',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '1rem'
          }}
        >
          Go to Invoice Details
        </button>
      </div>
    </div>
  )
}

