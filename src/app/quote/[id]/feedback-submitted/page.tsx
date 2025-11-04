'use client'

import { useParams } from 'next/navigation'
import { CheckCircle, Mail } from 'lucide-react'

export default function FeedbackSubmittedPage() {
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
          background: 'linear-gradient(to right, #9333ea, #ec4899)',
          marginBottom: '1.5rem'
        }}>
          <Mail style={{height: '3rem', width: '3rem', color: 'white'}} />
        </div>

        {/* Main Message */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          Feedback Received
        </h1>
        
        <p style={{
          fontSize: '1.125rem',
          color: '#cbd5e1',
          lineHeight: '1.6',
          marginBottom: '1.5rem'
        }}>
          Thank you for taking the time to share your thoughts with us. Your feedback is valuable and helps us improve our service.
        </p>

        <p style={{
          fontSize: '1rem',
          color: '#cbd5e1',
          lineHeight: '1.6'
        }}>
          We've received your feedback and will review it carefully. We'll be in touch soon to discuss how we can better meet your needs.
        </p>
      </div>
    </div>
  )
}

