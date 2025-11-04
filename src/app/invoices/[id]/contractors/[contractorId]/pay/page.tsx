'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { CheckCircle, CreditCard, ArrowLeft, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function ContractorFeePaymentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const invoiceId = params.id as string
  const contractorId = params.contractorId as string
  
  const [token, setToken] = useState<string>('')
  const [contractorData, setContractorData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      fetchContractorData(tokenParam)
    } else {
      setError('Payment token is required')
      setLoading(false)
    }
  }, [searchParams, invoiceId, contractorId])

  const fetchContractorData = async (paymentToken: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/contractors/${contractorId}/pay?token=${paymentToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setContractorData(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load contractor fee details')
      }
    } catch (err) {
      console.error('Error fetching contractor data:', err)
      setError('Failed to load contractor fee details')
    } finally {
      setLoading(false)
    }
  }

  const handleCompletePayment = async () => {
    setProcessing(true)
    setError('')

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/contractors/${contractorId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token
        })
      })

      if (response.ok) {
        // Redirect to thank you page
        window.location.href = `/invoices/${invoiceId}/contractors/${contractorId}/thank-you`
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to process payment')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('Failed to process payment')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
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
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <p style={{fontSize: '1.125rem'}}>Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (error && !contractorData) {
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
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center',
          color: 'white',
          maxWidth: '600px'
        }}>
          <XCircle style={{height: '3rem', width: '3rem', margin: '0 auto 1rem auto', color: '#f87171'}} />
          <h2 style={{color: '#f87171', marginBottom: '1rem', fontSize: '1.5rem'}}>
            Unable to Access Payment
          </h2>
          <p style={{fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem', color: '#cbd5e1'}}>
            {error}
          </p>
          <p style={{fontSize: '1rem', lineHeight: '1.6'}}>
            <a 
              href="https://uniquitousmusic.com/#contact" 
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#60a5fa',
                textDecoration: 'underline',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#93c5fd'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#60a5fa'}
            >
              Contact Uniquitous Music for assistance
            </a>
          </p>
        </div>
      </div>
    )
  }

  if (!contractorData) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0f172a 100%)',
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
        color: 'white'
      }}>
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            background: 'linear-gradient(to right, #9333ea, #c026d3)',
            marginBottom: '1rem'
          }}>
            <CreditCard style={{height: '2rem', width: '2rem', color: 'white'}} />
          </div>
          <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
            Contractor Fee Payment
          </h1>
          <p style={{fontSize: '1rem', opacity: 0.9, color: '#cbd5e1'}}>
            Pay your contractor fee to continue
          </p>
        </div>

        {/* Contractor Details */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white'}}>
            Contractor Details
          </h3>
          <div style={{marginBottom: '0.75rem'}}>
            <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Contractor:</p>
            <p style={{fontSize: '1rem', fontWeight: 'bold', color: 'white', margin: 0}}>
              {contractorData.contractorName}
            </p>
          </div>
          <div style={{marginBottom: '0.75rem'}}>
            <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Skills:</p>
            <p style={{fontSize: '1rem', color: 'white', margin: 0}}>
              {contractorData.contractorSkills.join(', ')}
            </p>
          </div>
          {contractorData.contractorNotes && (
            <div style={{marginBottom: '0.75rem'}}>
              <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Notes:</p>
              <p style={{
                fontSize: '0.875rem',
                color: '#cbd5e1',
                margin: 0,
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6'
              }}>
                {contractorData.contractorNotes}
              </p>
            </div>
          )}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            paddingTop: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize: '1rem', color: '#cbd5e1'}}>Fee Amount:</span>
              <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#9333ea'}}>
                ${contractorData.amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Form Placeholder */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '2px dashed rgba(255, 255, 255, 0.2)'
        }}>
          <p style={{textAlign: 'center', color: '#cbd5e1', fontSize: '0.875rem'}}>
            Payment processing will be integrated here
            <br />
            (Stripe, PayPal, etc.)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#f87171'
          }}>
            {error}
          </div>
        )}

        {/* Complete Payment Button */}
        <button
          onClick={handleCompletePayment}
          disabled={processing}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '1rem',
            background: processing 
              ? 'rgba(147, 51, 234, 0.5)' 
              : 'linear-gradient(to right, #9333ea, #c026d3)',
            border: 'none',
            borderRadius: '0.75rem',
            color: 'white',
            cursor: processing ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1.125rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!processing) {
              e.currentTarget.style.opacity = '0.9'
            }
          }}
          onMouseLeave={(e) => {
            if (!processing) {
              e.currentTarget.style.opacity = '1'
            }
          }}
        >
          <CheckCircle style={{height: '1.25rem', width: '1.25rem'}} />
          {processing ? 'Processing...' : `Complete Payment - $${contractorData.amount.toFixed(2)}`}
        </button>

        {/* Back Link */}
        <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#cbd5e1',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textDecoration: 'underline'
            }}
          >
            <ArrowLeft style={{height: '1rem', width: '1rem'}} />
            Back
          </button>
        </div>
      </div>
    </div>
  )
}

