'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, XCircle, CreditCard, Clock, User, Mail, Phone, MapPin } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

interface Client {
  id: string
  firstName?: string
  lastName?: string
  name: string
  email: string
  phone: string
  address: string
  company?: string
}

interface Contractor {
  id: string
  name: string
  email: string
  phone: string
  skills: string[]
  hourlyRate: number
  flatRate: number
  rate: number
}

interface QuoteItem {
  id: string
  serviceName: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  contractorId: string | null
  contractor?: Contractor
  serviceTemplateId: string | null
  sortOrder: number
}

interface QuoteContractor {
  id: string
  contractorId: string
  assignedSkills: string[]
  rateType: string
  hours: number | null
  cost: number
  includeInTotal: boolean
  contractor: Contractor
}

interface Quote {
  id: string
  quoteNumber: string
  project: string
  projectDescription: string
  status: string
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  validUntil: string
  terms: string
  notes: string
  client: Client
  items: QuoteItem[]
  contractors: QuoteContractor[]
}

export default function QuoteApprovalPage() {
  const params = useParams()
  const quoteId = params.id as string
  const [token, setToken] = useState<string>('')
  
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [processing, setProcessing] = useState(false)
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'full'>('deposit')
  
  // Calculate payment amounts
  const depositAmount = quote ? quote.total * 0.5 : 0
  const fullAmount = quote ? quote.total : 0
  const selectedAmount = paymentOption === 'deposit' ? depositAmount : fullAmount

  useEffect(() => {
    // Get token from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    if (urlToken) {
      setToken(urlToken)
      fetchQuote(quoteId, urlToken)
    } else {
      setError('Invalid approval link')
      setLoading(false)
    }
  }, [quoteId])

  const fetchQuote = async (id: string, approvalToken: string) => {
    try {
      const response = await fetch(`/api/quotes/${id}/approve?token=${approvalToken}`)
      if (response.ok) {
        const data = await response.json()
        setQuote(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load quote')
      }
    } catch (err) {
      setError('Failed to load quote')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!quote) return
    
    setProcessing(true)
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId,
          token,
          paymentOption,
          amount: selectedAmount
        })
      })

      if (response.ok) {
        const { sessionId } = await response.json()
        
        // Redirect to Stripe Checkout
        const { redirectToCheckout } = await import('@/lib/stripe-client')
        await redirectToCheckout(sessionId)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create payment session')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('Failed to process payment')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!quote) return
    
    setProcessing(true)
    try {
      const response = await fetch(`/api/quotes/${quoteId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })

      if (response.ok) {
        window.location.href = `/quote/${quoteId}/rejected`
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to reject quote')
      }
    } catch (err) {
      setError('Failed to reject quote')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <Clock style={{height: '3rem', width: '3rem', margin: '0 auto 1rem auto'}} />
          <h2>Loading Quote...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          color: 'white',
          maxWidth: '500px'
        }}>
          <XCircle style={{height: '3rem', width: '3rem', margin: '0 auto 1rem auto', color: '#f87171'}} />
          <h2 style={{color: '#f87171', marginBottom: '1rem'}}>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!quote) {
    return null
  }

  const contractorCostsTotal = quote.contractors
    .filter(c => c.includeInTotal)
    .reduce((sum, c) => sum + Number(c.cost), 0)
  const grandTotal = quote.total + contractorCostsTotal

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        padding: '2rem',
        color: 'white'
      }}>
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
            Quote Approval Required
          </h1>
          <p style={{fontSize: '1.25rem', opacity: 0.9}}>
            Quote #{quote.quoteNumber} - {quote.project}
          </p>
        </div>

        {/* Quote Details */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>
            Project Details
          </h2>
          <p style={{marginBottom: '1rem', lineHeight: '1.6'}}>
            {quote.projectDescription}
          </p>
          
          {/* Services */}
          {quote.items.length > 0 && (
            <div style={{marginBottom: '1.5rem'}}>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem'}}>
                Services
              </h3>
              {quote.items.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <div>
                    <p style={{fontWeight: '500', marginBottom: '0.25rem'}}>{item.serviceName}</p>
                    {item.description && (
                      <p style={{fontSize: '0.875rem', opacity: 0.8}}>{item.description}</p>
                    )}
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <p style={{fontWeight: 'bold'}}>${item.total.toFixed(2)}</p>
                    <p style={{fontSize: '0.875rem', opacity: 0.8}}>
                      {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contractors */}
          {quote.contractors.length > 0 && (
            <div style={{marginBottom: '1.5rem'}}>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem'}}>
                Contractors
              </h3>
              {quote.contractors.map((qc, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <div>
                    <p style={{fontWeight: '500', marginBottom: '0.25rem'}}>{qc.contractor.name}</p>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.25rem'}}>
                      {qc.assignedSkills.map(skill => (
                        <span key={skill} style={{
                          padding: '0.125rem 0.5rem',
                          backgroundColor: 'rgba(147, 51, 234, 0.2)',
                          border: '1px solid rgba(147, 51, 234, 0.3)',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          color: '#e9d5ff'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p style={{fontSize: '0.875rem', opacity: 0.8}}>
                      {qc.rateType === 'hourly' 
                        ? `${qc.hours} hrs @ $${qc.hours && qc.hours > 0 ? (qc.cost / qc.hours).toFixed(2) : '0.00'}/hr`
                        : 'Flat rate'
                      }
                    </p>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <p style={{fontWeight: 'bold'}}>${Number(qc.cost).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            paddingTop: '1rem'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
              <span>Subtotal:</span>
              <span>${quote.subtotal.toFixed(2)}</span>
            </div>
            {contractorCostsTotal > 0 && (
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                <span>Contractors:</span>
                <span>${contractorCostsTotal.toFixed(2)}</span>
              </div>
            )}
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
              <span>Tax ({quote.taxRate}%):</span>
              <span>${quote.taxAmount.toFixed(2)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              paddingTop: '0.5rem'
            }}>
              <span>Total:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>
            Payment Options
          </h2>
          
          <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
            <label style={{
              flex: 1,
              padding: '1rem',
              background: paymentOption === 'deposit' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: paymentOption === 'deposit' ? '2px solid #3b82f6' : '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              textAlign: 'center'
            }}>
              <input
                type="radio"
                name="paymentOption"
                value="deposit"
                checked={paymentOption === 'deposit'}
                onChange={(e) => setPaymentOption(e.target.value as 'deposit' | 'full')}
                style={{marginRight: '0.5rem'}}
              />
              <div>
                <p style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>50% Deposit</p>
                <p style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#60a5fa'}}>
                  ${depositAmount.toFixed(2)}
                </p>
                <p style={{fontSize: '0.875rem', opacity: 0.8}}>
                  Pay remaining ${(grandTotal - depositAmount).toFixed(2)} upon completion
                </p>
              </div>
            </label>

            <label style={{
              flex: 1,
              padding: '1rem',
              background: paymentOption === 'full' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: paymentOption === 'full' ? '2px solid #3b82f6' : '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              textAlign: 'center'
            }}>
              <input
                type="radio"
                name="paymentOption"
                value="full"
                checked={paymentOption === 'full'}
                onChange={(e) => setPaymentOption(e.target.value as 'deposit' | 'full')}
                style={{marginRight: '0.5rem'}}
              />
              <div>
                <p style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>Full Payment</p>
                <p style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#60a5fa'}}>
                  ${fullAmount.toFixed(2)}
                </p>
                <p style={{fontSize: '0.875rem', opacity: 0.8}}>
                  Complete payment upfront
                </p>
              </div>
            </label>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '0.5rem',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <p style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981'}}>
              Selected Payment: ${selectedAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Terms */}
        {quote.terms && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem'}}>
              Terms & Conditions
            </h3>
            <p style={{lineHeight: '1.6', fontSize: '0.875rem'}}>{quote.terms}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
          <button
            onClick={handleReject}
            disabled={processing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.75rem',
              color: '#f87171',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              opacity: processing ? 0.5 : 1
            }}
          >
            <XCircle style={{height: '1.25rem', width: '1.25rem'}} />
            {processing ? 'Processing...' : 'Decline Quote'}
          </button>

          <button
            onClick={handleApprove}
            disabled={processing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              background: 'linear-gradient(to right, #10b981, #14b8a6)',
              border: 'none',
              borderRadius: '0.75rem',
              color: 'white',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              opacity: processing ? 0.5 : 1
            }}
          >
            <CheckCircle style={{height: '1.25rem', width: '1.25rem'}} />
            {processing ? 'Processing...' : `Approve & Pay $${selectedAmount.toFixed(2)}`}
          </button>
        </div>

        {/* Valid Until */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '0.5rem'
        }}>
          <p style={{fontSize: '0.875rem', opacity: 0.8}}>
            This quote is valid until {new Date(quote.validUntil).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
