"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import UserMenu from "@/components/user-menu"
import { Plus, Search, Eye, CheckCircle, Clock, XCircle, Users, TrendingUp, Music, FileText, DollarSign } from "lucide-react"
import Navigation from "@/components/navigation"

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
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("draft")

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

  const filteredInvoices = invoices.filter(invoice => {
    // Status filter
    const statusMatch = statusFilter === "all" || invoice.status === statusFilter
    
    // Search filter
    const searchMatch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientCompany.toLowerCase().includes(searchTerm.toLowerCase())
    
    return statusMatch && searchMatch
  })

  const totalInvoices = invoices.length
  const paidInvoices = invoices.filter(i => i.status === "paid").length
  const pendingInvoices = invoices.filter(i => i.status === "sent").length
  const overdueInvoices = invoices.filter(i => i.status === "overdue").length
  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + parseFloat(i.total.toString()), 0)
  const pendingRevenue = invoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((sum, i) => sum + parseFloat(i.total.toString()), 0)



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
          <UserMenu />
        </div>

        {/* Navigation */}
        <Navigation />

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
            <div style={{position: 'relative', flex: '0 0 300px'}}>
              <Search style={{position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', height: '1rem', width: '1rem', color: '#94a3b8'}} />
              <input
                type="text"
                placeholder="Search invoices..."
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
            <div style={{position: 'relative'}}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
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
                            <CheckCircle style={{height: '1rem', width: '1rem', color: '#34d399'}} />
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
                        <Link href={`/invoices/${invoice.id}`}>
                          <button
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: 'rgba(59, 130, 246, 0.2)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '0.25rem',
                              color: '#60a5fa',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}
                          >
                            <Eye style={{height: '1rem', width: '1rem'}} />
                            View Details
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>


      </div>
    </div>
  )
}
