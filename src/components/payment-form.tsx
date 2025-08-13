"use client"

import { useState, useEffect } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { CardElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react'

interface PaymentFormProps {
  amount: number
  currency: string
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
  onCancel: () => void
  clientSecret: string
  invoiceId: string
}

export default function PaymentForm({
  amount,
  currency,
  onSuccess,
  onError,
  onCancel,
  clientSecret,
  invoiceId
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error'>('pending')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setMessage('')

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?invoiceId=${invoiceId}`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setMessage(error.message || 'Payment failed')
        setPaymentStatus('error')
        onError(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment successful!')
        setPaymentStatus('success')
        onSuccess(paymentIntent.id)
        
        // Update payment record in database
        await updatePaymentRecord(paymentIntent.id, 'completed')
      } else {
        setMessage('Payment processing...')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setMessage('An unexpected error occurred')
      setPaymentStatus('error')
      onError('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const updatePaymentRecord = async (paymentIntentId: string, status: string) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId,
          amount: amount,
          paymentMethod: 'card',
          paymentReference: paymentIntentId,
          status,
          notes: 'Payment processed via Stripe'
        }),
      })

      if (!response.ok) {
        console.error('Failed to update payment record')
      }
    } catch (error) {
      console.error('Error updating payment record:', error)
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  return (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '0.75rem',
      padding: '2rem',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <div style={{textAlign: 'center', marginBottom: '2rem'}}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          background: 'linear-gradient(to right, #9333ea, #ec4899)',
          marginBottom: '1rem'
        }}>
          <CreditCard style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
        </div>
        <h2 style={{color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
          Payment Details
        </h2>
        <p style={{color: '#cbd5e1', fontSize: '1rem'}}>
          Amount: {formatAmount(amount, currency)}
        </p>
      </div>

      {paymentStatus === 'success' ? (
        <div style={{textAlign: 'center'}}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            marginBottom: '1rem'
          }}>
            <CheckCircle style={{height: '1.5rem', width: '1.5rem', color: '#22c55e'}} />
          </div>
          <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
            Payment Successful!
          </h3>
          <p style={{color: '#cbd5e1'}}>Your payment has been processed successfully.</p>
        </div>
      ) : paymentStatus === 'error' ? (
        <div style={{textAlign: 'center'}}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            marginBottom: '1rem'
          }}>
            <XCircle style={{height: '1.5rem', width: '1.5rem', color: '#ef4444'}} />
          </div>
          <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
            Payment Failed
          </h3>
          <p style={{color: '#cbd5e1'}}>{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: '1.5rem'}}>
            <label style={{
              display: 'block',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Card Information
            </label>
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem'
            }}>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: 'white',
                      '::placeholder': {
                        color: '#cbd5e1',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {message && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: paymentStatus === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
              border: `1px solid ${paymentStatus === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              color: paymentStatus === 'error' ? '#fca5a5' : '#86efac'
            }}>
              {message}
            </div>
          )}

          <div style={{display: 'flex', gap: '1rem'}}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                opacity: isProcessing ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || isProcessing}
              style={{
                flex: 2,
                padding: '0.75rem 1rem',
                background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 style={{height: '1rem', width: '1rem', animation: 'spin 1s linear infinite'}} />
                  Processing...
                </>
              ) : (
                `Pay ${formatAmount(amount, currency)}`
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
