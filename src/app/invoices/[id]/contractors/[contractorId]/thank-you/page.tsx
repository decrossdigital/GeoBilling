'use client'

import { useParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ContractorFeeThankYouPage() {
  const params = useParams()
  const invoiceId = params.id as string

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '0.75rem',
        padding: '2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <CheckCircle style={{height: '4rem', width: '4rem', margin: '0 auto 1.5rem auto', color: '#10b981'}} />
        <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem'}}>
          Payment Received!
        </h1>
        <p style={{fontSize: '1.125rem', lineHeight: '1.6', marginBottom: '1.5rem', color: '#cbd5e1'}}>
          Thank you for your payment! The contractor fee has been processed successfully. 
          We appreciate your prompt payment.
        </p>
        <Link 
          href="/" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(to right, #9333ea, #ec4899)',
            borderRadius: '0.5rem',
            color: 'white',
            fontWeight: 'bold',
            textDecoration: 'none',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

