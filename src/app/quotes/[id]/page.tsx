'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Music, Home, Users, FileText, DollarSign, User, Settings } from 'lucide-react'
import QuoteHeader from '@/components/quotes/QuoteHeader'
import QuoteDetails from '@/components/quotes/QuoteDetails'
import QuoteServices from '@/components/quotes/QuoteServices'
import QuoteContractors from '@/components/quotes/QuoteContractors'
import QuoteModals from '@/components/quotes/QuoteModals'

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

interface Quote {
  id: string
  quoteNumber: string
  title: string
  description: string
  status: string
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  validUntil: string
  terms: string
  notes: string
  depositAmount: number
  createdAt: string
  updatedAt: string
  client: Client
  items: QuoteItem[]
}

export default function QuoteDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const quoteId = params.id as string

  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [selectedContractor, setSelectedContractor] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [converting, setConverting] = useState(false)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)
  const [showAddContractorModal, setShowAddContractorModal] = useState(false)
  const [showEditContractorModal, setShowEditContractorModal] = useState(false)
  const [editingItem, setEditingItem] = useState<QuoteItem | null>(null)
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  })
  const [serviceForm, setServiceForm] = useState({
    serviceName: '',
    description: '',
    quantity: 1,
    unitPrice: 0
  })

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch(`/api/quotes/${quoteId}`)
        if (response.ok) {
          const data = await response.json()
          setQuote(data)
          setEmailData({
            to: data.client.email,
            subject: `Quote #${data.quoteNumber} - ${data.title}`,
            message: `Dear ${data.client.name},\n\nPlease find attached our quote #${data.quoteNumber} for ${data.title}.\n\nTotal Amount: $${data.total.toFixed(2)}\nValid Until: ${new Date(data.validUntil).toLocaleDateString()}\n\nPlease let us know if you have any questions.\n\nBest regards,\nGeoBilling Team`
          })
        } else {
          console.error('Failed to fetch quote')
          alert('Failed to fetch quote details')
        }
      } catch (error) {
        console.error('Error fetching quote:', error)
        alert('Error fetching quote details')
      } finally {
        setLoading(false)
      }
    }

    const fetchContractors = async () => {
      try {
        const response = await fetch('/api/contractors')
        if (response.ok) {
          const data = await response.json()
          setContractors(data)
        }
      } catch (error) {
        console.error('Error fetching contractors:', error)
      }
    }

    if (session && quoteId) {
      fetchQuote()
      fetchContractors()
    }
  }, [session, quoteId])

  const handleSendEmail = async () => {
    setSendingEmail(true)
    try {
      const response = await fetch('/api/quotes/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId: quoteId,
          to: emailData.to,
          subject: emailData.subject,
          message: emailData.message
        })
      })

      if (response.ok) {
        alert('Quote sent successfully!')
        setShowEmailModal(false)
        setQuote(prev => prev ? { ...prev, status: 'sent' } : null)
      } else {
        alert('Failed to send quote')
      }
    } catch (error) {
      console.error('Error sending quote:', error)
      alert('Error sending quote')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleConvertToInvoice = async () => {
    setConverting(true)
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId: quoteId,
          clientId: quote?.client.id,
          clientName: quote?.client.name,
          clientEmail: quote?.client.email,
          clientPhone: quote?.client.phone,
          clientAddress: quote?.client.address,
          title: quote?.title,
          description: quote?.description,
          items: quote?.items,
          subtotal: quote?.subtotal,
          taxRate: quote?.taxRate,
          taxAmount: quote?.taxAmount,
          total: quote?.total,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'unpaid'
        })
      })

      if (response.ok) {
        const newInvoice = await response.json()
        
        await fetch(`/api/quotes/${quoteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...quote,
            status: 'converted'
          })
        })

        alert('Quote converted to invoice successfully!')
        router.push(`/invoices/${newInvoice.id}`)
      } else {
        alert('Failed to convert quote to invoice')
      }
    } catch (error) {
      console.error('Error converting quote:', error)
      alert('Error converting quote to invoice')
    } finally {
      setConverting(false)
    }
  }

  const handleDeleteService = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`/api/quotes/${quoteId}/items/${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const quoteResponse = await fetch(`/api/quotes/${quoteId}`)
        if (quoteResponse.ok) {
          const updatedQuote = await quoteResponse.json()
          setQuote(updatedQuote)
        }
        alert('Service deleted successfully!')
      } else {
        alert('Failed to delete service')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Error deleting service')
    }
  }

  const handleAddService = async () => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: serviceForm.serviceName,
          description: serviceForm.description,
          quantity: serviceForm.quantity,
          unitPrice: serviceForm.unitPrice,
          total: serviceForm.quantity * serviceForm.unitPrice
        })
      })

      if (response.ok) {
        const quoteResponse = await fetch(`/api/quotes/${quoteId}`)
        if (quoteResponse.ok) {
          const updatedQuote = await quoteResponse.json()
          setQuote(updatedQuote)
        }
        alert('Service added successfully!')
        setShowAddServiceModal(false)
        setServiceForm({ serviceName: '', description: '', quantity: 1, unitPrice: 0 })
      } else {
        alert('Failed to add service')
      }
    } catch (error) {
      console.error('Error adding service:', error)
      alert('Error adding service')
    }
  }

  const handleEditService = async () => {
    if (!editingItem) return

    try {
      const response = await fetch(`/api/quotes/${quoteId}/items/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: serviceForm.serviceName,
          description: serviceForm.description,
          quantity: serviceForm.quantity,
          unitPrice: serviceForm.unitPrice,
          total: serviceForm.quantity * serviceForm.unitPrice
        })
      })

      if (response.ok) {
        const quoteResponse = await fetch(`/api/quotes/${quoteId}`)
        if (quoteResponse.ok) {
          const updatedQuote = await quoteResponse.json()
          setQuote(updatedQuote)
        }
        alert('Service updated successfully!')
        setShowEditServiceModal(false)
        setEditingItem(null)
        setServiceForm({ serviceName: '', description: '', quantity: 1, unitPrice: 0 })
      } else {
        alert('Failed to update service')
      }
    } catch (error) {
      console.error('Error updating service:', error)
      alert('Error updating service')
    }
  }

  const handleAssignContractor = async () => {
    if (!selectedContractor) {
      alert('Please select a contractor')
      return
    }

    try {
      const response = await fetch(`/api/quotes/${quoteId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: "Contractor Assignment",
          description: "Contractor assigned to this quote",
          quantity: 1,
          unitPrice: 0,
          total: 0,
          contractorId: selectedContractor
        })
      })

      if (response.ok) {
        const quoteResponse = await fetch(`/api/quotes/${quoteId}`)
        if (quoteResponse.ok) {
          const updatedQuote = await quoteResponse.json()
          setQuote(updatedQuote)
        }
        alert('Contractor assigned successfully!')
        setShowAddContractorModal(false)
        setSelectedContractor('')
      } else {
        alert('Failed to assign contractor')
      }
    } catch (error) {
      console.error('Error assigning contractor:', error)
      alert('Error assigning contractor')
    }
  }

  const handleEditContractor = async () => {
    if (!editingItem || !selectedContractor) return

    try {
      const response = await fetch(`/api/quotes/${quoteId}/items/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractorId: selectedContractor
        })
      })

      if (response.ok) {
        const quoteResponse = await fetch(`/api/quotes/${quoteId}`)
        if (quoteResponse.ok) {
          const updatedQuote = await quoteResponse.json()
          setQuote(updatedQuote)
        }
        alert('Contractor updated successfully!')
        setShowEditContractorModal(false)
        setEditingItem(null)
        setSelectedContractor('')
      } else {
        alert('Failed to update contractor')
      }
    } catch (error) {
      console.error('Error updating contractor:', error)
      alert('Error updating contractor')
    }
  }

  const handleRemoveContractor = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this contractor?')) return

    try {
      const response = await fetch(`/api/quotes/${quoteId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractorId: null
        })
      })

      if (response.ok) {
        const quoteResponse = await fetch(`/api/quotes/${quoteId}`)
        if (quoteResponse.ok) {
          const updatedQuote = await quoteResponse.json()
          setQuote(updatedQuote)
        }
        alert('Contractor removed successfully!')
      } else {
        alert('Failed to remove contractor')
      }
    } catch (error) {
      console.error('Error removing contractor:', error)
      alert('Error removing contractor')
    }
  }

  const handleEditServiceClick = (item: QuoteItem) => {
    setEditingItem(item)
    setServiceForm({
      serviceName: item.serviceName,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })
    setShowEditServiceModal(true)
  }

  const handleEditContractorClick = (item: QuoteItem) => {
    setEditingItem(item)
    setSelectedContractor(item.contractorId || '')
    setShowEditContractorModal(true)
  }

  const handleEmailDataChange = (field: string, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }))
  }

  const handleServiceFormChange = (field: string, value: string | number) => {
    setServiceForm(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading quote details...</div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Quote not found</div>
      </div>
    )
  }

  const assignedContractors = quote.items.filter(item => item.contractorId)
  const regularServices = quote.items.filter(item => !item.contractorId || item.serviceName !== "Contractor Assignment")

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
              <button
                onClick={() => router.push('/')}
                style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer'}}
              >
                <Home style={{height: '1rem', width: '1rem'}} />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => router.push('/clients')}
                style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer'}}
              >
                <Users style={{height: '1rem', width: '1rem'}} />
                <span>Clients</span>
              </button>
              <button
                onClick={() => router.push('/quotes')}
                style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'linear-gradient(to right, #9333ea, #3b82f6)', color: 'white', textDecoration: 'none', fontWeight: '500', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: 'none', cursor: 'pointer'}}
              >
                <FileText style={{height: '1rem', width: '1rem'}} />
                <span>Quotes</span>
              </button>
              <button
                onClick={() => router.push('/invoices')}
                style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer'}}
              >
                <DollarSign style={{height: '1rem', width: '1rem'}} />
                <span>Invoices</span>
              </button>
              <button
                onClick={() => router.push('/contractors')}
                style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer'}}
              >
                <User style={{height: '1rem', width: '1rem'}} />
                <span>Contractors</span>
              </button>
              <button
                onClick={() => router.push('/settings')}
                style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer'}}
              >
                <Settings style={{height: '1rem', width: '1rem'}} />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div style={{marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
            <div>
              <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white'}}>Quote Details</h1>
              <p style={{color: '#cbd5e1'}}>Quote #{quote.quoteNumber} - {quote.title}</p>
            </div>
            <button
              onClick={() => router.back()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#60a5fa',
                textDecoration: 'none',
                fontSize: '0.875rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft style={{height: '1rem', width: '1rem'}} />
              Back to Quotes
            </button>
          </div>
        </div>

        {/* Quote Header Component */}
        <QuoteHeader
          quote={quote}
          onSendEmail={() => setShowEmailModal(true)}
          onConvertToInvoice={handleConvertToInvoice}
          converting={converting}
        />

        {/* Two Column Layout */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
          {/* Left Column - Client Info and Quote Details */}
          <div>
            <QuoteDetails quote={quote} />
          </div>

          {/* Right Column - Services and Contractors */}
          <div>
            <QuoteServices
              services={regularServices}
              onAddService={() => setShowAddServiceModal(true)}
              onEditService={handleEditServiceClick}
              onDeleteService={handleDeleteService}
            />

            <QuoteContractors
              contractors={assignedContractors}
              onAddContractor={() => setShowAddContractorModal(true)}
              onEditContractor={handleEditContractorClick}
              onRemoveContractor={handleRemoveContractor}
            />
          </div>
        </div>

        {/* Terms and Notes */}
        {(quote.terms || quote.notes) && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            {quote.terms && (
              <div style={{marginBottom: quote.notes ? '1.5rem' : 0}}>
                <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>Terms & Conditions</h2>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0}}>{quote.terms}</p>
              </div>
            )}
            {quote.notes && (
              <div>
                <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>Notes</h2>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0}}>{quote.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Quote Modals Component */}
        <QuoteModals
          showEmailModal={showEmailModal}
          showAddServiceModal={showAddServiceModal}
          showEditServiceModal={showEditServiceModal}
          showAddContractorModal={showAddContractorModal}
          showEditContractorModal={showEditContractorModal}
          sendingEmail={sendingEmail}
          contractors={contractors}
          selectedContractor={selectedContractor}
          editingItem={editingItem}
          serviceForm={serviceForm}
          emailData={emailData}
          onCloseEmailModal={() => setShowEmailModal(false)}
          onCloseAddServiceModal={() => {
            setShowAddServiceModal(false)
            setServiceForm({ serviceName: '', description: '', quantity: 1, unitPrice: 0 })
          }}
          onCloseEditServiceModal={() => {
            setShowEditServiceModal(false)
            setEditingItem(null)
            setServiceForm({ serviceName: '', description: '', quantity: 1, unitPrice: 0 })
          }}
          onCloseAddContractorModal={() => {
            setShowAddContractorModal(false)
            setSelectedContractor('')
          }}
          onCloseEditContractorModal={() => {
            setShowEditContractorModal(false)
            setEditingItem(null)
            setSelectedContractor('')
          }}
          onSendEmail={handleSendEmail}
          onAddService={handleAddService}
          onEditService={handleEditService}
          onAssignContractor={handleAssignContractor}
          onEditContractor={handleEditContractor}
          onEmailDataChange={handleEmailDataChange}
          onServiceFormChange={handleServiceFormChange}
          onSelectedContractorChange={setSelectedContractor}
        />
      </div>
    </div>
  )
}
