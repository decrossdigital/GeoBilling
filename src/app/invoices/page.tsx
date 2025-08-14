"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import UserMenu from "@/components/user-menu"
import { Plus, Search, Eye, Edit, Download, CreditCard, CheckCircle, Clock, XCircle, Users, FileText, DollarSign, TrendingUp, Music, Home, BarChart3, Settings, User, X } from "lucide-react"
import PaymentModal from "@/components/payment-modal"

interface Invoice {
  id: string
  invoiceNumber: string
  title: string
  clientName: string
  clientCompany: string
  total: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  issueDate: string
  dueDate: string
  paidDate?: string
  paymentMethod?: string
  items: InvoiceItem[]
}

interface InvoiceItem {
  id: string
  serviceName: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export default function InvoicesPage() {
  const { data: session } = useSession()
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean
    invoiceId: string
    amount: number
    currency: string
  }>({
    isOpen: false,
    invoiceId: "",
    amount: 0,
    currency: "usd",
  })

  // Fetch invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/invoices')
        if (response.ok) {
          const data = await response.json()
          setInvoices(data)
        } else {
          console.error('Failed to fetch invoices')
        }
      } catch (error) {
        console.error('Error fetching invoices:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchInvoices()
    }
  }, [session])

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clientCompany.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalInvoices = invoices.length
  const paidInvoices = invoices.filter(i => i.status === "paid").length
  const pendingInvoices = invoices.filter(i => i.status === "sent").length
  const overdueInvoices = invoices.filter(i => i.status === "overdue").length
  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + parseFloat(i.total.toString()), 0)
  const pendingRevenue = invoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((sum, i) => sum + parseFloat(i.total.toString()), 0)

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceModal(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    window.location.href = `/invoices/${invoice.id}/edit`
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    // This would generate and download a PDF
    console.log('Downloading invoice:', invoice.invoiceNumber)
    alert(`Downloading invoice ${invoice.invoiceNumber}`)
  }

  const handlePaymentClick = (invoice: Invoice) => {
    setPaymentModal({
      isOpen: true,
      invoiceId: invoice.id,
      amount: parseFloat(invoice.total.toString()),
      currency: "usd",
    })
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).getTime() !== new Date().getTime()
  }

  const handlePaymentSuccess = (paymentId: string) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === paymentModal.invoiceId 
        ? { ...invoice, status: "paid" as const, paidDate: new Date().toISOString().split('T')[0], paymentMethod: "Stripe" }
        : invoice
    ))
    setPaymentModal(prev => ({ ...prev, isOpen: false }))
  }

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
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div style={{marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
            <div>
              <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white'}}>Invoices</h1>
              <p style={{color: '#cbd5e1'}}>Manage your invoices and payment tracking</p>
            </div>
            <Link href="/invoices/new">
              <button style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500'
              }}>
                <Plus style={{height: '1rem', width: '1rem'}} />
                New Invoice
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Total Invoices</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>{totalInvoices}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>created</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', borderRadius: '0.75rem'}}>
                <DollarSign style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Paid</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>{paidInvoices}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>invoices</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #10b981, #14b8a6)', borderRadius: '0.75rem'}}>
                <CheckCircle style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Pending</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>{pendingInvoices}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>awaiting payment</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #f59e0b, #f97316)', borderRadius: '0.75rem'}}>
                <Clock style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Total Revenue</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>${totalRevenue.toLocaleString()}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>collected</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #059669, #0d9488)', borderRadius: '0.75rem'}}>
                <TrendingUp style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div style={{position: 'relative', flex: 1}}>
              <Search style={{position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', height: '1rem', width: '1rem', color: '#94a3b8'}} />
              <input
                type="text"
                placeholder="Search invoices by number, client, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', overflow: 'hidden'}}>
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: 'rgba(255, 255, 255, 0.05)'}}>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Invoice</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Client</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Amount</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Status</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Due Date</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Payment</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{textAlign: 'center', padding: '2rem'}}>Loading invoices...</td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{textAlign: 'center', padding: '2rem'}}>No invoices found.</td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} style={{borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}>
                      <td style={{padding: '1rem'}}>
                        <div style={{fontWeight: '500', color: 'white'}}>{invoice.invoiceNumber}</div>
                        <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>From {invoice.title}</div>
                        <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>Issued {new Date(invoice.issueDate).toLocaleDateString()}</div>
                      </td>
                      <td style={{padding: '1rem'}}>
                        <div style={{fontWeight: '500', color: 'white'}}>{invoice.clientName}</div>
                        <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{invoice.clientCompany}</div>
                      </td>
                      <td style={{padding: '1rem'}}>
                        <div style={{fontWeight: '500', color: 'white'}}>${invoice.total.toLocaleString()}</div>
                      </td>
                      <td style={{padding: '1rem'}}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: `rgba(${getStatusBgColor(invoice.status).replace('rgba(', '').replace(')', '').split(',').slice(0, 3).join(', ')}, 0.1)`,
                          color: getStatusColor(invoice.status)
                        }}>
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </div>
                      </td>
                      <td style={{padding: '1rem'}}>
                        <div style={{fontSize: '0.875rem', color: 'white'}}>
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                        {isOverdue(invoice.dueDate) && (
                          <div style={{fontSize: '0.75rem', color: '#f87171'}}>
                            {Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                          </div>
                        )}
                      </td>
                      <td style={{padding: '1rem'}}>
                        {invoice.status === "paid" ? (
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <CreditCard style={{height: '1rem', width: '1rem', color: '#34d399'}} />
                            <div>
                              <div style={{fontSize: '0.875rem', color: 'white'}}>{invoice.paymentMethod}</div>
                              <div style={{fontSize: '0.75rem', color: '#cbd5e1'}}>{invoice.paidDate && new Date(invoice.paidDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ) : (
                          <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>Pending</div>
                        )}
                      </td>
                      <td style={{padding: '1rem'}}>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: 'rgba(59, 130, 246, 0.2)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '0.25rem',
                              color: '#60a5fa',
                              cursor: 'pointer'
                            }}
                            title="View Invoice"
                          >
                            <Eye style={{height: '1rem', width: '1rem'}} />
                          </button>
                          <button
                            onClick={() => handleEditInvoice(invoice)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: 'rgba(251, 191, 36, 0.2)',
                              border: '1px solid rgba(251, 191, 36, 0.3)',
                              borderRadius: '0.25rem',
                              color: '#fbbf24',
                              cursor: 'pointer'
                            }}
                            title="Edit Invoice"
                          >
                            <Edit style={{height: '1rem', width: '1rem'}} />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(invoice)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: 'rgba(16, 185, 129, 0.2)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: '0.25rem',
                              color: '#34d399',
                              cursor: 'pointer'
                            }}
                            title="Download Invoice"
                          >
                            <Download style={{height: '1rem', width: '1rem'}} />
                          </button>
                          {invoice.status === "sent" && (
                            <button 
                              onClick={() => handlePaymentClick(invoice)}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: 'rgba(251, 191, 36, 0.2)',
                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                borderRadius: '0.25rem',
                                color: '#fbbf24',
                                cursor: 'pointer'
                              }}
                              title="Process Payment"
                            >
                              <CreditCard style={{height: '1rem', width: '1rem'}} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Details Modal */}
        {showInvoiceModal && selectedInvoice && (
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
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white'}}>Invoice Details</h2>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.25rem',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <X style={{height: '1rem', width: '1rem'}} />
                </button>
              </div>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div>
                    <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Invoice Number</label>
                    <div style={{fontWeight: '500', color: 'white'}}>{selectedInvoice.invoiceNumber}</div>
                  </div>
                  <div>
                    <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Status</label>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: `rgba(${getStatusBgColor(selectedInvoice.status).replace('rgba(', '').replace(')', '').split(',').slice(0, 3).join(', ')}, 0.1)`,
                      color: getStatusColor(selectedInvoice.status)
                    }}>
                      {getStatusIcon(selectedInvoice.status)}
                      {selectedInvoice.status}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Client</label>
                  <div style={{fontWeight: '500', color: 'white'}}>{selectedInvoice.clientName}</div>
                  <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{selectedInvoice.clientCompany}</div>
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div>
                    <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Amount</label>
                    <div style={{fontWeight: '500', color: 'white', fontSize: '1.125rem'}}>${selectedInvoice.total.toLocaleString()}</div>
                  </div>
                  <div>
                    <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Due Date</label>
                    <div style={{fontSize: '0.875rem', color: 'white'}}>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div>
                    <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Quote Number</label>
                    <div style={{fontSize: '0.875rem', color: 'white'}}>{selectedInvoice.title}</div>
                  </div>
                  <div>
                    <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Issued Date</label>
                    <div style={{fontSize: '0.875rem', color: 'white'}}>{new Date(selectedInvoice.issueDate).toLocaleDateString()}</div>
                  </div>
                </div>
                
                {selectedInvoice.paidDate && (
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                    <div>
                      <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Paid Date</label>
                      <div style={{fontSize: '0.875rem', color: 'white'}}>{new Date(selectedInvoice.paidDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Payment Method</label>
                      <div style={{fontSize: '0.875rem', color: 'white'}}>{selectedInvoice.paymentMethod}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}
          amount={paymentModal.amount}
          currency={paymentModal.currency}
          invoiceId={paymentModal.invoiceId}
          onSuccess={handlePaymentSuccess}
          onError={(error) => {
            console.error('Payment error:', error)
            alert(`Payment failed: ${error}`)
          }}
        />
      </div>
    </div>
  )
}
