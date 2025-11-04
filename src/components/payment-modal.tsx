"use client"

import { useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import PaymentForm from './payment-form'
import { X, CreditCard } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  currency: string
  invoiceId: string
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  currency,
  invoiceId,
  onSuccess,
  onError
}: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && amount > 0) {
      createPaymentIntent()
    }
  }, [isOpen, amount])

  const createPaymentIntent = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          invoiceId,
          description: `Payment for invoice ${invoiceId}`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret: secret } = await response.json()
      setClientSecret(secret)
    } catch (error) {
      console.error('Error creating payment intent:', error)
      onError('Failed to initialize payment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = (paymentId: string) => {
    onSuccess(paymentId)
    onClose()
  }

  const handleError = (error: string) => {
    onError(error)
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <div style={{
              padding: '0.5rem',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              borderRadius: '0.5rem'
            }}>
              <CreditCard style={{height: '1rem', width: '1rem', color: 'white'}} />
            </div>
            <h2 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold'}}>
              Process Payment
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X style={{height: '1rem', width: '1rem'}} />
          </button>
        </div>

        {/* Content */}
        <div style={{padding: '1.5rem'}}>
          {isLoading ? (
            <div style={{textAlign: 'center', padding: '2rem'}}>
              <div style={{
                display: 'inline-block',
                width: '2rem',
                height: '2rem',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{color: '#cbd5e1', marginTop: '1rem'}}>Initializing payment...</p>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                amount={amount}
                currency={currency}
                onSuccess={handleSuccess}
                onError={handleError}
                onCancel={onClose}
                clientSecret={clientSecret}
                invoiceId={invoiceId}
              />
            </Elements>
          ) : (
            <div style={{textAlign: 'center', padding: '2rem'}}>
              <p style={{color: '#cbd5e1'}}>Failed to initialize payment. Please try again.</p>
              <button
                onClick={createPaymentIntent}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
