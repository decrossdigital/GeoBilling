"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import UserMenu from "@/components/user-menu"
import { Plus, Search, Eye, Edit, Download, Clock, CheckCircle, XCircle, Users, FileText, DollarSign, TrendingUp, Music, Home, BarChart3, Settings, User } from "lucide-react"

interface Quote {
  id: string
  quoteNumber: string
  title: string
  clientName: string
  clientCompany: string
  total: number
  status: "draft" | "sent" | "accepted" | "rejected" | "expired"
  validUntil: string
  createdAt: string
  items: QuoteItem[]
}

interface QuoteItem {
  id: string
  serviceName: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export default function QuotesPage() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch quotes from API
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch('/api/quotes')
        if (response.ok) {
          const data = await response.json()
          setQuotes(data)
        } else {
          console.error('Failed to fetch quotes')
        }
      } catch (error) {
        console.error('Error fetching quotes:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchQuotes()
    }
  }, [session])

  const filteredQuotes = quotes.filter(quote =>
    quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.clientCompany.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalQuotes = quotes.length
  const draftQuotes = quotes.filter(q => q.status === "draft").length
  const sentQuotes = quotes.filter(q => q.status === "sent").length
  const acceptedQuotes = quotes.filter(q => q.status === "accepted").length
  const totalValue = quotes.reduce((sum, q) => sum + parseFloat(q.total.toString()), 0)

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote)
    setShowQuoteModal(true)
  }

  const handleEditQuote = (quote: Quote) => {
    window.location.href = `/quotes/${quote.id}/edit`
  }

  const handleDownloadQuote = (quote: Quote) => {
    // This would generate and download a PDF
    console.log('Downloading quote:', quote.quoteNumber)
    alert(`Downloading quote ${quote.quoteNumber}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "#94a3b8"
      case "sent":
        return "#3b82f6"
      case "accepted":
        return "#34d399"
      case "rejected":
        return "#f87171"
      case "expired":
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
      case "accepted":
        return "rgba(52, 211, 153, 0.1)"
      case "rejected":
        return "rgba(248, 113, 113, 0.1)"
      case "expired":
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
      case "accepted":
        return <CheckCircle style={{height: '1rem', width: '1rem'}} />
      case "rejected":
        return <XCircle style={{height: '1rem', width: '1rem'}} />
      case "expired":
        return <Clock style={{height: '1rem', width: '1rem'}} />
      default:
        return <FileText style={{height: '1rem', width: '1rem'}} />
    }
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
              <Link href="/quotes" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'linear-gradient(to right, #9333ea, #3b82f6)', color: 'white', textDecoration: 'none', fontWeight: '500', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}>
                <FileText style={{height: '1rem', width: '1rem'}} />
                <span>Quotes</span>
              </Link>
              <Link href="/invoices" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <DollarSign style={{height: '1rem', width: '1rem'}} />
                <span>Invoices</span>
              </Link>
              <Link href="/contractors" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <User style={{height: '1rem', width: '1rem'}} />
                <span>Contractors</span>
              </Link>
              <Link href="/reports" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <BarChart3 style={{height: '1rem', width: '1rem'}} />
                <span>Reports</span>
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
              <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white'}}>Quotes</h1>
              <p style={{color: '#cbd5e1'}}>Manage your project quotes and proposals</p>
            </div>
            <Link href="/quotes/new">
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
                New Quote
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Total Quotes</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>{totalQuotes}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>created</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', borderRadius: '0.75rem'}}>
                <FileText style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Draft</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>{draftQuotes}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>quotes</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #94a3b8, #6b7280)', borderRadius: '0.75rem'}}>
                <FileText style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Sent</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>{sentQuotes}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>awaiting response</span>
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
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Total Value</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>${totalValue.toLocaleString()}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>in quotes</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #059669, #0d9488)', borderRadius: '0.75rem'}}>
                <DollarSign style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
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
                placeholder="Search quotes by number, client, or company..."
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

        {/* Quotes Table */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', overflow: 'hidden'}}>
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: 'rgba(255, 255, 255, 0.05)'}}>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Quote</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Client</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Services</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Amount</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Status</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Valid Until</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{textAlign: 'center', padding: '2rem'}}>Loading quotes...</td>
                  </tr>
                ) : filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{textAlign: 'center', padding: '2rem'}}>No quotes found.</td>
                  </tr>
                ) : (
                  filteredQuotes.map((quote) => (
                    <tr key={quote.id} style={{borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}>
                      <td style={{padding: '1rem'}}>
                        <div style={{fontWeight: '500', color: 'white'}}>{quote.quoteNumber}</div>
                        <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>{new Date(quote.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td style={{padding: '1rem'}}>
                        <div style={{fontWeight: '500', color: 'white'}}>{quote.clientName}</div>
                        <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{quote.clientCompany}</div>
                      </td>
                      <td style={{padding: '1rem'}}>
                        <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{quote.items.map(item => item.serviceName).join(', ')}</div>
                      </td>
                      <td style={{padding: '1rem'}}>
                        <div style={{fontWeight: '500', color: 'white'}}>${parseFloat(quote.total.toString()).toLocaleString()}</div>
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
                          backgroundColor: getStatusBgColor(quote.status),
                          color: getStatusColor(quote.status)
                        }}>
                          {getStatusIcon(quote.status)}
                          {quote.status}
                        </div>
                      </td>
                      <td style={{padding: '1rem'}}>
                        <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{new Date(quote.validUntil).toLocaleDateString()}</div>
                      </td>
                      <td style={{padding: '1rem'}}>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button
                            onClick={() => handleViewQuote(quote)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: 'rgba(59, 130, 246, 0.2)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '0.25rem',
                              color: '#60a5fa',
                              cursor: 'pointer'
                            }}
                            title="View Quote"
                          >
                            <Eye style={{height: '1rem', width: '1rem'}} />
                          </button>
                          <button
                            onClick={() => handleEditQuote(quote)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: 'rgba(251, 191, 36, 0.2)',
                              border: '1px solid rgba(251, 191, 36, 0.3)',
                              borderRadius: '0.25rem',
                              color: '#fbbf24',
                              cursor: 'pointer'
                            }}
                            title="Edit Quote"
                          >
                            <Edit style={{height: '1rem', width: '1rem'}} />
                          </button>
                          <button
                            onClick={() => handleDownloadQuote(quote)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: 'rgba(16, 185, 129, 0.2)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: '0.25rem',
                              color: '#34d399',
                              cursor: 'pointer'
                            }}
                            title="Download Quote"
                          >
                            <Download style={{height: '1rem', width: '1rem'}} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quote Details Modal */}
        {showQuoteModal && selectedQuote && (
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
                <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white'}}>Quote Details</h2>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.25rem',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <XCircle style={{height: '1rem', width: '1rem'}} />
                </button>
              </div>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div>
                    <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Quote Number</label>
                    <div style={{fontWeight: '500', color: 'white'}}>{selectedQuote.quoteNumber}</div>
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
                      backgroundColor: getStatusBgColor(selectedQuote.status),
                      color: getStatusColor(selectedQuote.status)
                    }}>
                      {getStatusIcon(selectedQuote.status)}
                      {selectedQuote.status}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Client</label>
                  <div style={{fontWeight: '500', color: 'white'}}>{selectedQuote.clientName}</div>
                  <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{selectedQuote.clientCompany}</div>
                </div>
                
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Services</label>
                  <div style={{fontSize: '0.875rem', color: 'white'}}>{selectedQuote.items.map(item => `${item.serviceName} (${item.quantity} x $${item.unitPrice.toLocaleString()})`).join(', ')}</div>
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div>
                    <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Total Amount</label>
                    <div style={{fontWeight: '500', color: 'white', fontSize: '1.125rem'}}>${parseFloat(selectedQuote.total.toString()).toLocaleString()}</div>
                  </div>
                  <div>
                    <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Valid Until</label>
                    <div style={{fontSize: '0.875rem', color: 'white'}}>{new Date(selectedQuote.validUntil).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Created</label>
                  <div style={{fontSize: '0.875rem', color: 'white'}}>{new Date(selectedQuote.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
