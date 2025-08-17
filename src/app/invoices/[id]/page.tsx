'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Music, Home, Users, FileText, DollarSign, User, Settings, CreditCard, Send, Download, Edit, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface Contractor {
  id: string
  name: string
  email: string
  phone: string
  hourlyRate: number
  flatRate: number
}

interface InvoiceItem {
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

interface Invoice {
  id: string
  invoiceNumber: string
  title: string
  description: string
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  issueDate: string
  dueDate: string
  paidDate?: string
  paymentMethod?: string
  paymentReference?: string
  terms: string
  notes: string
  createdAt: string
  updatedAt: string
  client: Client
  items: InvoiceItem[]
  quoteId?: string
}

export default function InvoiceDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  })

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}`)
        if (response.ok) {
          const data = await response.json()
          setInvoice(data)
          setEmailData({
            to: data.client.email,
            subject: `Invoice ${data.invoiceNumber} from ${data.userName || 'GeoBilling'}`,
            message: `Dear ${data.client.name},\n\nPlease find attached invoice ${data.invoiceNumber} for ${data.title}.\n\nTotal Amount: $${(data.total || 0).toFixed(2)}\nDue Date: ${new Date(data.dueDate).toLocaleDateString()}\n\nThank you for your business.\n\nBest regards,\n${data.userName || 'GeoBilling Team'}`
          })
        } else {
          console.error('Error fetching invoice details')
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session && invoiceId) {
      fetchInvoice()
    }
  }, [session, invoiceId])

  const handleSendEmail = async () => {
    if (!invoice) return
    
    setSendingEmail(true)
    try {
      const response = await fetch('/api/invoices/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoiceId,
          to: emailData.to,
          subject: emailData.subject,
          message: emailData.message
        })
      })

      if (response.ok) {
        alert('Invoice sent successfully!')
        setShowEmailModal(false)
        // Refresh invoice data
        const refreshResponse = await fetch(`/api/invoices/${invoiceId}`)
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setInvoice(data)
        }
      } else {
        alert('Failed to send invoice')
      }
    } catch (error) {
      console.error('Error sending invoice:', error)
      alert('Error sending invoice')
    } finally {
      setSendingEmail(false)
    }
  }

  const handlePayment = async () => {
    if (!invoice) return
    
    setProcessingPayment(true)
    try {
      // TODO: Implement actual payment processing
      // For now, just update the status to paid
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...invoice,
          status: 'paid',
          paidDate: new Date().toISOString(),
          paymentMethod: 'Manual',
          paymentReference: `PAY-${Date.now()}`
        })
      })

      if (response.ok) {
        alert('Payment processed successfully!')
        setShowPaymentModal(false)
        // Refresh invoice data
        const refreshResponse = await fetch(`/api/invoices/${invoiceId}`)
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setInvoice(data)
        }
      } else {
        alert('Failed to process payment')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Error processing payment')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleDownload = () => {
    // TODO: Implement PDF generation and download
    alert('PDF download functionality will be implemented')
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          alert('Invoice deleted successfully!')
          router.push('/invoices')
        } else {
          alert('Failed to delete invoice')
        }
      } catch (error) {
        console.error('Error deleting invoice:', error)
        alert('Error deleting invoice')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "#94a3b8"
      case "sent":
        return "#3b82f6"
      case "paid":
        return "#34d399"
      case "overdue":
        return "#f87171"
      case "cancelled":
        return "#f59e0b"
      default:
        return "#94a3b8"
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "draft":
        return "rgba(148, 163, 184, 0.1)"
      case "sent":
        return "rgba(59, 130, 246, 0.1)"
      case "paid":
        return "rgba(52, 211, 153, 0.1)"
      case "overdue":
        return "rgba(248, 113, 113, 0.1)"
      case "cancelled":
        return "rgba(245, 158, 11, 0.1)"
      default:
        return "rgba(148, 163, 184, 0.1)"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FileText style={{height: '1rem', width: '1rem'}} />
      case "sent":
        return <Clock style={{height: '1rem', width: '1rem'}} />
      case "paid":
        return <CheckCircle style={{height: '1rem', width: '1rem'}} />
      case "overdue":
        return <XCircle style={{height: '1rem', width: '1rem'}} />
      case "cancelled":
        return <XCircle style={{height: '1rem', width: '1rem'}} />
      default:
        return <FileText style={{height: '1rem', width: '1rem'}} />
    }
  }

  if (loading) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div>Loading invoice...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div>Invoice not found</div>
      </div>
    )
  }

  const regularServices = invoice.items.filter(item => !item.contractorId)
  const assignedContractors = invoice.items.filter(item => item.contractorId)

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white'}}>
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem'}}>
        {/* Header */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #9333ea, #ec4899)', borderRadius: '1rem'}}>
              <Music style={{height: '2rem', width: '2rem', color: 'white'}} />
            </div>
            <div>
              <h1 style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white'}}>GeoBilling</h1>
              <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Uniquitous Music - Professional Billing System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <Link href="/" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <Home style={{height: '1rem', width: '1rem'}} />
                <span>Dashboard</span>
              </Link>
              <Link href="/clients" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <Users style={{height: '1rem', width: '1rem'}} />
                <span>Clients</span>
              </Link>
              <Link href="/quotes" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <FileText style={{height: '1rem', width: '1rem'}} />
                <span>Quotes</span>
              </Link>
              <Link href="/invoices" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'linear-gradient(to right, #9333ea, #3b82f6)', color: 'white', textDecoration: 'none', fontWeight: '500', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}>
                <DollarSign style={{height: '1rem', width: '1rem'}} />
                <span>Invoices</span>
              </Link>
              <Link href="/contractors" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <User style={{height: '1rem', width: '1rem'}} />
                <span>Contractors</span>
              </Link>
              <Link href="/settings" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <Settings style={{height: '1rem', width: '1rem'}} />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Back Button and Invoice Header */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem'}}>
          <button
            onClick={() => router.push('/invoices')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft style={{height: '1rem', width: '1rem'}} />
            Back to Invoices
          </button>

          <div style={{display: 'flex', gap: '0.5rem'}}>
            {invoice.status === 'sent' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(to right, #10b981, #059669)',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <CreditCard style={{height: '1rem', width: '1rem'}} />
                Process Payment
              </button>
            )}
            <button
              onClick={() => setShowEmailModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <Send style={{height: '1rem', width: '1rem'}} />
              Send via Email
            </button>
            <button
              onClick={handleDownload}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <Download style={{height: '1rem', width: '1rem'}} />
              Download PDF
            </button>
            <button
              onClick={handleDelete}
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
              Delete
            </button>
          </div>
        </div>

        {/* Invoice Title and Status */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '2rem', marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
            <div>
              <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>{invoice.title}</h1>
              <p style={{fontSize: '1.125rem', color: '#cbd5e1'}}>Invoice #{invoice.invoiceNumber}</p>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              backgroundColor: getStatusBgColor(invoice.status),
              color: getStatusColor(invoice.status)
            }}>
              {getStatusIcon(invoice.status)}
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
          {/* Left Column - Client Info and Invoice Details */}
          <div>
            {/* Client Information */}
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>Client Information</h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Name</label>
                  <div style={{fontWeight: '500', color: 'white'}}>{invoice.client.name}</div>
                </div>
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Email</label>
                  <div style={{color: 'white'}}>{invoice.client.email}</div>
                </div>
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Phone</label>
                  <div style={{color: 'white'}}>{invoice.client.phone}</div>
                </div>
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Address</label>
                  <div style={{color: 'white'}}>{invoice.client.address}</div>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>Invoice Details</h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div>
                    <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Issue Date</label>
                    <div style={{color: 'white'}}>{new Date(invoice.issueDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Due Date</label>
                    <div style={{color: 'white'}}>{new Date(invoice.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>
                {invoice.paidDate && (
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                    <div>
                      <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Paid Date</label>
                      <div style={{color: 'white'}}>{new Date(invoice.paidDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Payment Method</label>
                      <div style={{color: 'white'}}>{invoice.paymentMethod}</div>
                    </div>
                  </div>
                )}
                {invoice.quoteId && (
                  <div>
                    <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Converted from Quote</label>
                    <div style={{color: 'white'}}>Quote #{invoice.quoteId}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>Financial Summary</h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                                 <div style={{display: 'flex', justifyContent: 'space-between'}}>
                   <span style={{color: '#cbd5e1'}}>Subtotal:</span>
                   <span style={{color: 'white'}}>${(invoice.subtotal || 0).toFixed(2)}</span>
                 </div>
                 <div style={{display: 'flex', justifyContent: 'space-between'}}>
                   <span style={{color: '#cbd5e1'}}>Tax ({invoice.taxRate || 0}%):</span>
                   <span style={{color: 'white'}}>${(invoice.taxAmount || 0).toFixed(2)}</span>
                 </div>
                 <div style={{borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between'}}>
                   <span style={{fontWeight: 'bold', color: 'white'}}>Total:</span>
                   <span style={{fontWeight: 'bold', color: 'white', fontSize: '1.125rem'}}>${(invoice.total || 0).toFixed(2)}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column - Services and Contractors */}
          <div>
            {/* Services */}
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>Services</h2>
              {regularServices.length === 0 ? (
                <p style={{color: '#cbd5e1', fontStyle: 'italic'}}>No services added</p>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  {regularServices.map((item) => (
                    <div key={item.id} style={{border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', padding: '1rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                        <div style={{flex: 1}}>
                          <div style={{fontWeight: '500', color: 'white', marginBottom: '0.25rem'}}>{item.serviceName}</div>
                          {item.description && (
                            <div style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem'}}>{item.description}</div>
                          )}
                          <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>
                            {item.quantity} × ${(item.unitPrice || 0).toFixed(2)}
                          </div>
                        </div>
                        <div style={{fontWeight: '500', color: 'white'}}>${(item.total || 0).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contractors */}
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>Contractors</h2>
              {assignedContractors.length === 0 ? (
                <p style={{color: '#cbd5e1', fontStyle: 'italic'}}>No contractors assigned</p>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  {assignedContractors.map((item) => (
                    <div key={item.id} style={{border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', padding: '1rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                        <div style={{flex: 1}}>
                          <div style={{fontWeight: '500', color: 'white', marginBottom: '0.25rem'}}>
                            {item.contractor?.name || 'Unknown Contractor'}
                          </div>
                          <div style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>
                            {item.contractor?.email}
                          </div>
                          <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>
                            {item.quantity} × ${(item.unitPrice || 0).toFixed(2)}
                          </div>
                        </div>
                        <div style={{fontWeight: '500', color: 'white'}}>${(item.total || 0).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Terms and Notes */}
        {(invoice.terms || invoice.notes) && (
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', marginTop: '2rem'}}>
            {invoice.terms && (
              <div style={{marginBottom: '1.5rem'}}>
                <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem'}}>Terms & Conditions</h3>
                <div style={{color: '#cbd5e1', lineHeight: '1.6'}}>{invoice.terms}</div>
              </div>
            )}
            {invoice.notes && (
              <div>
                <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem'}}>Notes</h3>
                <div style={{color: '#cbd5e1', lineHeight: '1.6'}}>{invoice.notes}</div>
              </div>
            )}
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem'}}>Send Invoice via Email</h2>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem'}}>
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>To:</label>
                  <input
                    type="email"
                    value={emailData.to}
                    onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Subject:</label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Message:</label>
                  <textarea
                    value={emailData.message}
                    onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
              
              <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                <button
                  onClick={() => setShowEmailModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: sendingEmail ? 'not-allowed' : 'pointer',
                    opacity: sendingEmail ? 0.6 : 1
                  }}
                >
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              padding: '2rem',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>Process Payment</h2>
                             <p style={{color: '#cbd5e1', marginBottom: '1.5rem'}}>
                 Mark invoice #{invoice.invoiceNumber} as paid for ${(invoice.total || 0).toFixed(2)}?
               </p>
              
              <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(to right, #10b981, #059669)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: processingPayment ? 'not-allowed' : 'pointer',
                    opacity: processingPayment ? 0.6 : 1
                  }}
                >
                  {processingPayment ? 'Processing...' : 'Mark as Paid'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
