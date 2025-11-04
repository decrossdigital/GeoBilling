'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, CreditCard, Clock } from 'lucide-react'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const quoteId = searchParams.get('quote_id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (sessionId && quoteId) {
      // Payment was successful, redirect to quote approved page
      window.location.href = `/quote/${quoteId}/approved?payment=success&session_id=${sessionId}`
    } else {
      setError('Invalid payment session')
      setLoading(false)
    }
  }, [sessionId, quoteId])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <Clock style={{height: '3rem', width: '3rem', margin: '0 auto 1rem auto'}} />
          <h2>Processing Payment...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          color: 'white',
          maxWidth: '500px'
        }}>
          <h2 style={{color: '#f59e0b', marginBottom: '1rem'}}>Payment Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return null
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <Clock style={{height: '3rem', width: '3rem', margin: '0 auto 1rem auto'}} />
          <h2>Loading...</h2>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
