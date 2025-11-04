'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'

function PaymentCancelContent() {
  const searchParams = useSearchParams()
  const quoteId = searchParams.get('quote_id')

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '600px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <XCircle style={{
          height: '4rem',
          width: '4rem',
          margin: '0 auto 2rem auto',
          color: '#f59e0b'
        }} />
        
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          Payment Cancelled
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          marginBottom: '2rem',
          opacity: 0.9
        }}>
          Your payment was cancelled. No charges have been made to your account.
        </p>

        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            What's Next?
          </h2>
          
          <p style={{
            marginBottom: '1.5rem',
            lineHeight: '1.6'
          }}>
            You can return to the quote approval page to try the payment again, 
            or contact us if you have any questions about the payment process.
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {quoteId && (
              <Link
                href={`/quote/${quoteId}/approve?token=${searchParams.get('token') || ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#60a5fa',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                <CreditCard style={{height: '1.25rem', width: '1.25rem'}} />
                Try Payment Again
              </Link>
            )}
            
            <Link
              href="mailto:george@uniquitousmusic.com"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                textDecoration: 'none'
              }}
            >
              Contact Support
            </Link>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
          opacity: 0.8
        }}>
          <p>
            If you have any questions about this quote or payment, please contact us at{' '}
            <a href="mailto:george@uniquitousmusic.com" style={{color: '#60a5fa'}}>
              george@uniquitousmusic.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{fontSize: '1.5rem', marginBottom: '1rem'}}>Loading...</div>
        </div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  )
}
