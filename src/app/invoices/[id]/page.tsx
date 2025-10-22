'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Music, Home, Users, FileText, DollarSign, User, Settings, Edit, Save, X, Trash2, CreditCard } from 'lucide-react'
import Link from 'next/link'
import UserMenu from '@/components/user-menu'

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

interface InvoiceItem {
  id: string
  serviceName: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  taxable: boolean
  contractorId: string | null
  contractor?: Contractor
  serviceTemplateId: string | null
  sortOrder: number
}

interface InvoiceContractor {
  id: string
  contractorId: string
  assignedSkills: string[]
  rateType: string
  hours: number | null
  cost: number
  includeInTotal: boolean
  contractor: Contractor
}

interface Invoice {
  id: string
  invoiceNumber: string
  project: string
  projectDescription: string
  status: string
  issueDate: string
  dueDate: string
  paidDate: string | null
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes: string
  terms: string
  activityLog?: string
  client: Client
  items: InvoiceItem[]
  contractors: InvoiceContractor[]
}

export default function InvoiceDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice()
    }
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load invoice')
      }
    } catch (err) {
      setError('Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  const handlePayInvoice = async () => {
    if (!invoice) return
    
    setProcessing(true)
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: invoice.total
        })
      })

      if (response.ok) {
        const { sessionId } = await response.json()
        
        // Redirect to Stripe Checkout
        const { redirectToCheckout } = await import('@/lib/stripe-client')
        await redirectToCheckout(sessionId)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to create payment session')
      }
    } catch (err) {
      console.error('Payment error:', err)
      alert('Failed to process payment')
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteInvoice = async () => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Invoice deleted successfully!')
        router.push('/invoices')
      } else {
        const errorData = await response.json()
        alert(`Failed to delete invoice: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
      alert('Error deleting invoice')
    }
  }

  const getClientName = (client: Client) => {
    if (client.firstName && client.lastName) {
      return `${client.firstName} ${client.lastName}`
    }
    if (client.firstName) {
      return client.firstName
    }
    if (client.company) {
      return client.company
    }
    return client.name
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#6b7280'
      case 'sent': return '#3b82f6'
      case 'paid': return '#10b981'
      case 'overdue': return '#f59e0b'
      case 'cancelled': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'sent': return 'Sent'
      case 'paid': return 'Paid'
      case 'overdue': return 'Overdue'
      case 'cancelled': return 'Cancelled'
      default: return status
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
        <div style={{color: 'white', textAlign: 'center'}}>
          <h2>Loading invoice...</h2>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{color: 'white', textAlign: 'center'}}>
          <h2>Error loading invoice</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const contractorCostsTotal = invoice.contractors
    .filter(c => c.includeInTotal)
    .reduce((sum, c) => sum + Number(c.cost), 0)
  const grandTotal = invoice.total + contractorCostsTotal

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Navigation */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
            <Link href="/invoices" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none'}}>
              <ArrowLeft style={{height: '1.25rem', width: '1.25rem'}} />
              Back to Invoices
            </Link>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <Link href="/" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', opacity: 0.7}}>
                <Home style={{height: '1.25rem', width: '1.25rem'}} />
                Dashboard
              </Link>
              <Link href="/clients" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', opacity: 0.7}}>
                <Users style={{height: '1.25rem', width: '1.25rem'}} />
                Clients
              </Link>
              <Link href="/quotes" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', opacity: 0.7}}>
                <FileText style={{height: '1.25rem', width: '1.25rem'}} />
                Quotes
              </Link>
              <Link href="/invoices" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', fontWeight: 'bold'}}>
                <DollarSign style={{height: '1.25rem', width: '1.25rem'}} />
                Invoices
              </Link>
              <Link href="/contractors" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', opacity: 0.7}}>
                <User style={{height: '1.25rem', width: '1.25rem'}} />
                Contractors
              </Link>
              <Link href="/settings" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', opacity: 0.7}}>
                <Settings style={{height: '1.25rem', width: '1.25rem'}} />
                Settings
              </Link>
            </div>
          </div>
          
          <UserMenu />
        </div>
      </div>

      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem'}}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          color: 'white'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '2rem'
          }}>
            <div>
              <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                Invoice #{invoice.invoiceNumber}
              </h1>
              <p style={{fontSize: '1.25rem', opacity: 0.9}}>
                {invoice.project}
              </p>
            </div>
            <div style={{
              padding: '0.5rem 1rem',
              backgroundColor: `rgba(${getStatusColor(invoice.status).slice(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.2)`,
              border: `1px solid ${getStatusColor(invoice.status)}`,
              borderRadius: '9999px',
              color: getStatusColor(invoice.status),
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              {getStatusText(invoice.status)}
            </div>
          </div>

          {/* Client and Invoice Info */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
              <div>
                <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>
                  Client Information
                </h3>
                <p style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>{getClientName(invoice.client)}</p>
                <p style={{color: '#cbd5e1', marginBottom: '0.25rem'}}>{invoice.client.email}</p>
                {invoice.client.phone && <p style={{color: '#cbd5e1', marginBottom: '0.25rem'}}>{invoice.client.phone}</p>}
                {invoice.client.address && <p style={{color: '#cbd5e1'}}>{invoice.client.address}</p>}
              </div>
              <div>
                <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>
                  Invoice Details
                </h3>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                  <span>Issue Date:</span>
                  <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                  <span>Due Date:</span>
                  <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
                {invoice.paidDate && (
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                    <span>Paid Date:</span>
                    <span>{new Date(invoice.paidDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Services */}
          {invoice.items.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>
                Services
              </h3>
              {invoice.items.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <div>
                    <p style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>{item.serviceName}</p>
                    {item.description && <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{item.description}</p>}
                    <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>
                      {item.quantity} × ${item.unitPrice.toFixed(2)}
                      {item.taxable && <span style={{color: '#10b981', marginLeft: '0.5rem'}}>Taxable</span>}
                    </p>
                  </div>
                  <p style={{fontWeight: 'bold'}}>${item.total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Contractors */}
          {invoice.contractors.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>
                Contractors
              </h3>
              {invoice.contractors.map((ic, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <div>
                    <p style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>{ic.contractor.name}</p>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.25rem'}}>
                      {ic.assignedSkills.map(skill => (
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
                    <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>
                      {ic.rateType === 'hourly' 
                        ? `${ic.hours} hrs @ $${ic.hours && ic.hours > 0 ? (ic.cost / ic.hours).toFixed(2) : '0.00'}/hr`
                        : 'Flat rate'
                      }
                      {!ic.includeInTotal && <span style={{color: '#f59e0b', marginLeft: '0.5rem'}}>(Not included in total)</span>}
                    </p>
                  </div>
                  <p style={{fontWeight: 'bold'}}>${Number(ic.cost).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>
              Invoice Summary
            </h3>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
              <span>Subtotal:</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            {contractorCostsTotal > 0 && (
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                <span>Contractors:</span>
                <span>${contractorCostsTotal.toFixed(2)}</span>
              </div>
            )}
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
              <span>Tax ({invoice.taxRate}%):</span>
              <span>${invoice.taxAmount.toFixed(2)}</span>
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

          {/* Notes and Terms */}
          {(invoice.notes || invoice.terms) && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              {invoice.notes && (
                <div style={{marginBottom: '1rem'}}>
                  <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                    Notes
                  </h3>
                  <p style={{lineHeight: '1.6'}}>{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                    Terms & Conditions
                  </h3>
                  <p style={{lineHeight: '1.6'}}>{invoice.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* Activity Log Section (Admin Only) */}
          {invoice.activityLog && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>
                Activity Log (Admin Only)
              </h3>
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '0.5rem',
                padding: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                color: '#cbd5e1',
                whiteSpace: 'pre-wrap',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {invoice.activityLog}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem'}}>
            {invoice.status === 'sent' && (
              <button
                onClick={handlePayInvoice}
                disabled={processing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 2rem',
                  background: processing ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(to right, #10b981, #14b8a6)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: 'white',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1.125rem',
                  opacity: processing ? 0.5 : 1
                }}
              >
                <CreditCard style={{height: '1.25rem', width: '1.25rem'}} />
                {processing ? 'Processing...' : `Pay $${grandTotal.toFixed(2)}`}
              </button>
            )}
          </div>

          {/* Delete Invoice Button */}
          <div style={{display: 'flex', justifyContent: 'center', marginTop: '2rem'}}>
            <button
              onClick={handleDeleteInvoice}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.5rem',
                color: '#f87171',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <Trash2 style={{height: '1rem', width: '1rem'}} />
              Delete Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}