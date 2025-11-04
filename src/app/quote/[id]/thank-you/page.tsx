'use client'

import { useParams } from 'next/navigation'
import { CheckCircle, Heart } from 'lucide-react'

export default function QuoteThankYouPage() {
  const params = useParams()
  const quoteId = params.id as string

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0f172a 100%)',
      padding: '2rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '0.75rem',
        padding: '3rem 2rem',
        color: 'white',
        textAlign: 'center'
      }}>
        {/* Success Icon */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '5rem',
          height: '5rem',
          borderRadius: '50%',
          background: 'linear-gradient(to right, #10b981, #14b8a6)',
          marginBottom: '1.5rem'
        }}>
          <CheckCircle style={{height: '3rem', width: '3rem', color: 'white'}} />
        </div>

        {/* Main Message */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          Thank You!
        </h1>
        
        <p style={{
          fontSize: '1.125rem',
          color: '#cbd5e1',
          lineHeight: '1.6',
          marginBottom: '1.5rem'
        }}>
          Thank you for approving your quote! We're excited to work with you on this project.
        </p>

        <p style={{
          fontSize: '1rem',
          color: '#cbd5e1',
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          We'll be in touch shortly to get started. If you have any questions in the meantime, please don't hesitate to reach out.
        </p>

        {/* Heart Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '2rem',
          color: '#ec4899'
        }}>
          <Heart style={{height: '1.5rem', width: '1.5rem', fill: '#ec4899'}} />
          <span style={{fontSize: '0.875rem', color: '#cbd5e1'}}>
            We appreciate your business!
          </span>
        </div>
      </div>
    </div>
  )
}

