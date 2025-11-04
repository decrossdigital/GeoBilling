'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { CheckCircle, CreditCard, ArrowLeft } from 'lucide-react'

export default function QuotePaymentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const quoteId = params.id as string
  
  const [token, setToken] = useState<string>('')
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'full'>('deposit')
  const [amount, setAmount] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    const paymentOptionParam = searchParams.get('paymentOption') as 'deposit' | 'full'
    const amountParam = searchParams.get('amount')
    const totalParam = searchParams.get('total')

    if (tokenParam) setToken(tokenParam)
    if (paymentOptionParam) setPaymentOption(paymentOptionParam)
    if (amountParam) setAmount(parseFloat(amountParam))
    if (totalParam) setTotal(parseFloat(totalParam))
  }, [searchParams])

  const handleCompletePayment = async () => {
    setProcessing(true)
    setError('')

    try {
      const response = await fetch(`/api/quotes/${quoteId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          paymentOption,
          amount,
          termsAgreed: true
        })
      })

      if (response.ok) {
        // Redirect to thank you page
        window.location.href = `/quote/${quoteId}/thank-you`
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
            background: 'linear-gradient(to right, #10b981, #14b8a6)',
            marginBottom: '1rem'
          }}>
            <CreditCard style={{height: '2rem', width: '2rem', color: 'white'}} />
          </div>
          <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
            Complete Your Payment
          </h1>
          <p style={{fontSize: '1rem', opacity: 0.9, color: '#cbd5e1'}}>
            {paymentOption === 'deposit' 
              ? 'Pay your 50% deposit to get started' 
              : 'Complete full payment upfront'}
          </p>
        </div>

        {/* Payment Summary */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <span style={{fontSize: '1rem', color: '#cbd5e1'}}>Payment Type:</span>
            <span style={{fontSize: '1rem', fontWeight: 'bold'}}>
              {paymentOption === 'deposit' ? '50% Deposit' : 'Full Payment'}
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <span style={{fontSize: '1rem', color: '#cbd5e1'}}>Amount:</span>
            <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981'}}>
              ${amount.toFixed(2)}
            </span>
          </div>

          {paymentOption === 'deposit' && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginTop: '1rem'
            }}>
              <p style={{fontSize: '0.875rem', color: '#10b981', margin: 0, textAlign: 'center'}}>
                Remaining balance of ${(total - amount).toFixed(2)} due upon project completion
              </p>
            </div>
          )}
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
              ? 'rgba(16, 185, 129, 0.5)' 
              : 'linear-gradient(to right, #10b981, #14b8a6)',
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
          {processing ? 'Processing...' : `Complete Payment - $${amount.toFixed(2)}`}
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
            Back to Quote
          </button>
        </div>
      </div>
    </div>
  )
}

