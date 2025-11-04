'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, CreditCard, ArrowLeft, XCircle, Loader2 } from 'lucide-react'

interface ContractorData {
  name: string
  skills: string[]
  notes: string
  amount: number
}

interface BulkPaymentData {
  contractors: ContractorData[]
  totalAmount: number
  invoiceNumber: string
}

export default function BulkContractorPaymentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const invoiceId = params.id as string

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [paymentData, setPaymentData] = useState<BulkPaymentData | null>(null)
  const [paymentToken, setPaymentToken] = useState<string>('')

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setPaymentToken(tokenParam)
      fetchBulkPaymentData(tokenParam)
    } else {
      setError('Payment token is required')
      setLoading(false)
    }
  }, [searchParams, invoiceId])

  const fetchBulkPaymentData = async (token: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/contractors/bulk-pay?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentData(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load contractor fee details')
      }
    } catch (err) {
      console.error('Error fetching bulk payment data:', err)
      setError('Failed to load contractor fee details')
    } finally {
      setLoading(false)
    }
  }

  const handleCompletePayment = async () => {
    setProcessing(true)
    setError('')

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/contractors/bulk-pay?token=${paymentToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}) // No body needed for mock payment
      })

      if (response.ok) {
        router.push(`/invoices/${invoiceId}/contractors/bulk-thank-you`)
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
      <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0f172a 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{color: 'white', textAlign: 'center'}}>
          <Loader2 style={{height: '2rem', width: '2rem', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto'}} />
          <h2>Loading payment details...</h2>
        </div>
      </div>
    )
  }

  if (error && !paymentData) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0f172a 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{color: 'white', textAlign: 'center'}}>
          <XCircle style={{height: '3rem', width: '3rem', margin: '0 auto 1rem auto', color: '#f87171'}} />
          <h2 style={{color: '#f87171'}}>Error</h2>
          <p>{error}</p>
          <a href={`https://uniquitousmusic.com/#contact`} style={{color: '#60a5fa', textDecoration: 'underline'}}>Contact Uniquitous Music for assistance</a>
        </div>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0f172a 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{color: 'white', textAlign: 'center'}}>
          <h2>Contractor fee details not found.</h2>
          <p>Please ensure you have a valid link.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0f172a 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem'}}>
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '0.75rem',
        padding: '2rem',
        width: '90%',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <CheckCircle style={{height: '3rem', width: '3rem', color: '#10b981', margin: '0 auto 1.5rem auto'}} />
        <h2 style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>
          Contractor Fees Payment
        </h2>
        <p style={{color: '#cbd5e1', marginBottom: '2rem'}}>
          Please complete the payment for contractor fees associated with Invoice #{paymentData.invoiceNumber}.
        </p>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <h3 style={{color: 'white', fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem'}}>
            Contractors ({paymentData.contractors.length})
          </h3>
          {paymentData.contractors.map((contractor, index) => (
            <div key={index} style={{
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.5rem',
              marginBottom: index < paymentData.contractors.length - 1 ? '1rem' : '0'
            }}>
              <p style={{color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Contractor:</p>
              <p style={{color: 'white', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                {contractor.name}
              </p>
              <p style={{color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Skills:</p>
              <p style={{color: 'white', marginBottom: '0.5rem', fontSize: '0.875rem'}}>
                {contractor.skills.join(', ')}
              </p>
              {contractor.notes && (
                <>
                  <p style={{color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Notes:</p>
                  <p style={{color: 'white', fontSize: '0.875rem', whiteSpace: 'pre-wrap', marginBottom: '0.5rem'}}>
                    {contractor.notes}
                  </p>
                </>
              )}
              <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Amount:</span>
                <span style={{color: '#9333ea', fontSize: '1rem', fontWeight: 'bold'}}>
                  ${contractor.amount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          <div style={{
            borderTop: '2px solid rgba(255, 255, 255, 0.2)',
            marginTop: '1rem',
            paddingTop: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{color: '#cbd5e1', fontSize: '1rem', fontWeight: '600'}}>Total Amount Due:</span>
            <span style={{color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold'}}>
              ${paymentData.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

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

        <button
          onClick={handleCompletePayment}
          disabled={processing}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.75rem 1.5rem',
            background: processing ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(to right, #10b981, #14b8a6)',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: processing ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            fontSize: '1rem',
            opacity: processing ? 0.7 : 1,
            transition: 'all 0.2s'
          }}
        >
          {processing ? (
            <>
              <Loader2 style={{height: '1.25rem', width: '1.25rem', animation: 'spin 1s linear infinite'}} />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard style={{height: '1.25rem', width: '1.25rem'}} />
              Complete Payment - ${paymentData.totalAmount.toFixed(2)}
            </>
          )}
        </button>

        <div style={{marginTop: '1.5rem'}}>
          <a href={`/invoices/${invoiceId}`} style={{color: '#60a5fa', textDecoration: 'underline', fontSize: '0.875rem'}}>
            <ArrowLeft style={{height: '0.875rem', width: '0.875rem', display: 'inline-block', verticalAlign: 'middle', marginRight: '0.25rem'}} />
            Back to Invoice
          </a>
        </div>
      </div>
    </div>
  )
}

