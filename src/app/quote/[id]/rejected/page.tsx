'use client'

import { useParams } from 'next/navigation'
import { XCircle, MessageCircle, Mail } from 'lucide-react'

export default function QuoteRejectedPage() {
  const params = useParams()
  const quoteId = params.id as string

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
          Quote Declined
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          marginBottom: '2rem',
          opacity: 0.9
        }}>
          We understand that you've decided not to proceed with this quote at this time.
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
            We're Here to Help
          </h2>
          
          <p style={{
            marginBottom: '1.5rem',
            lineHeight: '1.6'
          }}>
            If you have any questions about the quote or would like to discuss modifications, 
            we'd be happy to help. We can adjust the scope, timeline, or pricing to better 
            meet your needs.
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.5rem'
            }}>
              <MessageCircle style={{height: '1.25rem', width: '1.25rem'}} />
              <span>Discuss modifications to the quote</span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.5rem'
            }}>
              <Mail style={{height: '1.25rem', width: '1.25rem'}} />
              <span>Get a revised quote for your project</span>
            </div>
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
            Contact us at{' '}
            <a href="mailto:george@uniquitousmusic.com" style={{color: '#60a5fa'}}>
              george@uniquitousmusic.com
            </a>
            {' '}or call{' '}
            <a href="tel:(609) 316-8080" style={{color: '#60a5fa'}}>
              (609) 316-8080
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
