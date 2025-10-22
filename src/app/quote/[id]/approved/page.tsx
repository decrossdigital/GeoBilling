'use client'

import { useParams } from 'next/navigation'
import { CheckCircle, CreditCard, Clock } from 'lucide-react'

export default function QuoteApprovedPage() {
  const params = useParams()
  const quoteId = params.id as string
  const urlParams = new URLSearchParams(window.location.search)
  const payment = urlParams.get('payment') || 'deposit'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
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
        <CheckCircle style={{
          height: '4rem',
          width: '4rem',
          margin: '0 auto 2rem auto',
          color: '#10b981'
        }} />
        
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          Quote Approved!
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          marginBottom: '2rem',
          opacity: 0.9
        }}>
          Thank you for approving the quote. Your payment has been processed successfully.
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
            Payment Details
          </h2>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <CreditCard style={{height: '1.5rem', width: '1.5rem'}} />
            <span style={{fontSize: '1.25rem', fontWeight: 'bold'}}>
              {payment === 'deposit' ? '50% Deposit Paid' : 'Full Payment Completed'}
            </span>
          </div>
          
          <p style={{fontSize: '0.875rem', opacity: 0.8}}>
            {payment === 'deposit' 
              ? 'The remaining balance will be due upon project completion.'
              : 'Your project is fully paid and ready to begin.'
            }
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            What's Next?
          </h3>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <Clock style={{height: '1.25rem', width: '1.25rem'}} />
            <span>We'll begin work on your project</span>
          </div>
          
          <p style={{fontSize: '0.875rem', opacity: 0.8}}>
            You'll receive updates on the progress and any additional information needed.
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
          opacity: 0.8
        }}>
          <p>
            If you have any questions, please contact us at{' '}
            <a href="mailto:george@uniquitousmusic.com" style={{color: '#60a5fa'}}>
              george@uniquitousmusic.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
