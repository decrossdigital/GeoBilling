'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Music, Home, Users, FileText, DollarSign, User, Settings, Edit, Save, X, Trash2 } from 'lucide-react'
import Link from 'next/link'
import UserMenu from '@/components/user-menu'
import QuoteHeader from '@/components/quotes/QuoteHeader'
import QuoteDetails from '@/components/quotes/QuoteDetails'
import QuoteServices from '@/components/quotes/QuoteServices'
import QuoteContractors from '@/components/quotes/QuoteContractors'
import QuoteModals from '@/components/quotes/QuoteModals'
import { processQuoteTemplate, getClientName } from '@/lib/template-processor'

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

interface Quote {
  id: string
  quoteNumber: string
  title: string
  description: string
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
  const [availableSkills, setAvailableSkills] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [filteredContractors, setFilteredContractors] = useState<Contractor[]>([])
  const [contractorRateType, setContractorRateType] = useState<'hourly' | 'flat'>('hourly')
  const [contractorHours, setContractorHours] = useState(1)
  const [contractorCost, setContractorCost] = useState(0)
  const [assignedContractors, setAssignedContractors] = useState<any[]>([])
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
  const [originalTemplate, setOriginalTemplate] = useState({
    subject: '',
    message: ''
  })
  const [showPreview, setShowPreview] = useState(false)
  const [serviceForm, setServiceForm] = useState({
    serviceName: '',
    description: '',
    quantity: 1,
    unitPrice: 0
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    project: '',
    projectDescription: '',
    validUntil: '',
    terms: '',
    notes: ''
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

  // Load available skills from localStorage (managed in Settings)
  useEffect(() => {
    const savedSkills = localStorage.getItem('availableSkills')
    if (savedSkills) {
      try {
        setAvailableSkills(JSON.parse(savedSkills))
      } catch (error) {
        console.error('Failed to load skills:', error)
      }
    }
  }, [])

  // Load assigned contractors
  useEffect(() => {
    const fetchAssignedContractors = async () => {
      if (!quoteId) return
      
      try {
        const response = await fetch(`/api/quotes/${quoteId}/contractors`)
        if (response.ok) {
          const data = await response.json()
          setAssignedContractors(data)
        }
      } catch (error) {
        console.error('Error fetching assigned contractors:', error)
      }
    }
    
    if (session && quoteId) {
      fetchAssignedContractors()
    }
  }, [session, quoteId])

  // Filter contractors by selected skills
  useEffect(() => {
    if (selectedSkills.length === 0) {
      setFilteredContractors(contractors)
    } else {
      const filtered = contractors.filter(contractor =>
        selectedSkills.every(skill => contractor.skills.includes(skill))
      )
      setFilteredContractors(filtered)
    }
  }, [selectedSkills, contractors])

  // Calculate contractor cost
  useEffect(() => {
    if (!selectedContractor) {
      setContractorCost(0)
      return
    }
    
    const contractor = contractors.find(c => c.id === selectedContractor)
    if (!contractor) return
    
    if (contractorRateType === 'hourly') {
      const rate = contractor.hourlyRate || contractor.rate
      setContractorCost(contractorHours * Number(rate))
    } else {
      setContractorCost(Number(contractor.flatRate || contractor.rate))
    }
  }, [selectedContractor, contractorRateType, contractorHours, contractors])

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
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Failed to send quote'
        alert(`Failed to send quote: ${errorMessage}`)
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
          project: quote?.project,
          projectDescription: quote?.projectDescription,
          items: quote?.items,
          subtotal: quote?.subtotal,
          taxRate: quote?.taxRate,
          taxAmount: quote?.taxAmount,
          total: quote?.total,
          notes: quote?.notes,
          terms: quote?.terms,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'draft'
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

  const handleOpenEmailModal = () => {
    if (!quote) return

    // Load email templates from localStorage
    const savedTemplates = localStorage.getItem('emailTemplates')
    const templates = savedTemplates ? JSON.parse(savedTemplates) : {
      quoteSubject: "Quote {{quoteNumber}} - {{project}}",
      quoteBody: "Dear {{clientName}},\n\nThank you for your interest in our services. We're pleased to present our quote for \"{{project}}\".\n\nQUOTE DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nQuote Number: {{quoteNumber}}\nValid Until: {{validUntil}}\nTotal Amount: ${{total}}\n\n{{servicesSection}}\n\n{{contractorsSection}}\n\nNOTES\n{{notes}}\n\nTERMS & CONDITIONS\n{{terms}}\n\nYou can view the complete quote details and accept online at:\n{{quoteUrl}}\n\nIf you have any questions about this quote, please contact us at:\n{{companyEmail}} | {{companyPhone}}\n\nBest regards,\n{{companyName}}"
    }

    // Company settings (would come from settings in real app)
    const companySettings = {
      name: "Uniquitous Music",
      email: "george@uniquitousmusic.com",
      phone: "(609) 316-8080",
      address: "123 Music Studio Lane, NJ 08540"
    }

    const quoteUrl = `${window.location.origin}/quotes/${quoteId}`

    // Process templates
    const processedSubject = processQuoteTemplate(templates.quoteSubject, quote, companySettings, quoteUrl)
    const processedBody = processQuoteTemplate(templates.quoteBody, quote, companySettings, quoteUrl)

    // Save original for reset functionality
    setOriginalTemplate({
      subject: processedSubject,
      message: processedBody
    })

    setEmailData({
      to: quote.client.email,
      subject: processedSubject,
      message: processedBody
    })

    setShowEmailModal(true)
  }

  const handleResetToTemplate = () => {
    setEmailData({
      ...emailData,
      subject: originalTemplate.subject,
      message: originalTemplate.message
    })
  }

  const handleDeleteQuote = async () => {
    if (!confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Quote deleted successfully!')
        router.push('/quotes')
      } else {
        alert('Failed to delete quote')
      }
    } catch (error) {
      console.error('Error deleting quote:', error)
      alert('Error deleting quote')
    }
  }

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const handleAssignContractor = async () => {
    if (!selectedContractor || selectedSkills.length === 0) {
      alert('Please select skills and a contractor')
      return
    }
    
    try {
      const response = await fetch(`/api/quotes/${quoteId}/contractors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractorId: selectedContractor,
          assignedSkills: selectedSkills,
          rateType: contractorRateType,
          hours: contractorRateType === 'hourly' ? contractorHours : null,
          cost: contractorCost,
          includeInTotal: true
        })
      })
      
      if (response.ok) {
        const newAssignment = await response.json()
        setAssignedContractors([...assignedContractors, newAssignment])
        // Reset form
        setSelectedSkills([])
        setSelectedContractor('')
        setContractorHours(1)
        setContractorRateType('hourly')
        setShowAddContractorModal(false)
        alert('Contractor assigned successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to assign contractor: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error assigning contractor:', error)
      alert('Error assigning contractor')
    }
  }

  const handleRemoveContractor = async (contractorId: string) => {
    if (!confirm('Remove this contractor from the quote?')) return
    
    try {
      const response = await fetch(`/api/quotes/${quoteId}/contractors/${contractorId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setAssignedContractors(assignedContractors.filter(c => c.id !== contractorId))
        alert('Contractor removed successfully!')
      } else {
        alert('Failed to remove contractor')
      }
    } catch (error) {
      console.error('Error removing contractor:', error)
      alert('Error removing contractor')
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

  const handleEmailDataChange = (field: string, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }))
  }

  const handleServiceFormChange = (field: string, value: string | number) => {
    setServiceForm(prev => ({ ...prev, [field]: value }))
  }

  const handleEditClick = () => {
    if (quote) {
      setEditData({
        project: quote.project || '',
        projectDescription: quote.projectDescription || '',
        validUntil: quote.validUntil,
        terms: quote.terms || '',
        notes: quote.notes || ''
      })
      setIsEditing(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!quote) return

    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...quote,
          project: editData.project,
          projectDescription: editData.projectDescription,
          validUntil: editData.validUntil,
          terms: editData.terms,
          notes: editData.notes
        })
      })

      if (response.ok) {
        const updatedQuote = await response.json()
        setQuote(updatedQuote)
        setIsEditing(false)
        alert('Quote updated successfully!')
      } else {
        alert('Failed to update quote')
      }
    } catch (error) {
      console.error('Error updating quote:', error)
      alert('Error updating quote')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleEditDataChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }))
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
              <Link href="/services" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <Settings style={{height: '1rem', width: '1rem'}} />
                <span>Services</span>
              </Link>
            </div>
            <UserMenu />
          </div>
        </div>

        {/* Back to Quotes Link */}
        <div style={{marginBottom: '2rem'}}>
          <Link href="/quotes" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', textDecoration: 'none', fontSize: '0.875rem'}}>
            <ArrowLeft style={{height: '1rem', width: '1rem'}} />
            Back to Quotes
          </Link>
        </div>

                {/* Quote Header with Client Information and Quote Details */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '2rem', marginBottom: '2rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div style={{flex: 1}}>
              <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>
                Quote #{quote.quoteNumber}
              </h1>
              
              {/* Client and Project Information */}
              <div style={{marginBottom: '1.5rem'}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                  <div>
                    <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Name:</span>
                    <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{quote.client.name}</p>
                  </div>
                  <div>
                    <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Email:</span>
                    <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{quote.client.email}</p>
                  </div>
                  <div>
                    <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Phone:</span>
                    <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{quote.client.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Address:</span>
                    <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{quote.client.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Project:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.project}
                        onChange={(e) => handleEditDataChange('project', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          border: '2px solid rgba(59, 130, 246, 0.5)',
                          borderRadius: '0.25rem',
                          color: 'white',
                          outline: 'none',
                          marginTop: '0.25rem',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                          transition: 'all 0.2s'
                        }}
                        placeholder="Enter project name..."
                      />
                    ) : (
                      <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{quote.project || 'Not specified'}</p>
                    )}
                  </div>
                  <div>
                    <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Project Description:</span>
                    {isEditing ? (
                      <textarea
                        value={editData.projectDescription}
                        onChange={(e) => handleEditDataChange('projectDescription', e.target.value)}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          border: '2px solid rgba(59, 130, 246, 0.5)',
                          borderRadius: '0.25rem',
                          color: 'white',
                          outline: 'none',
                          resize: 'vertical',
                          marginTop: '0.25rem',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                          transition: 'all 0.2s'
                        }}
                        placeholder="Describe the project details..."
                      />
                    ) : (
                      <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{quote.projectDescription || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

 
            </div>
            
            {/* Status Badge */}
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.2)'}}>
              <div style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                backgroundColor: quote.status === 'draft' ? '#6b7280' : 
                               quote.status === 'sent' ? '#3b82f6' : 
                               quote.status === 'accepted' ? '#10b981' : 
                               quote.status === 'rejected' ? '#ef4444' : '#6b7280'
              }} />
              <span style={{color: 'white', fontWeight: '500', textTransform: 'capitalize'}}>{quote.status}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap'}}>
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <Edit style={{height: '1rem', width: '1rem'}} />
              Edit Details
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveEdit}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(to right, #10b981, #14b8a6)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <Save style={{height: '1rem', width: '1rem'}} />
                Save Changes
              </button>
              <button
                onClick={handleCancelEdit}
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
                <X style={{height: '1rem', width: '1rem'}} />
                Cancel
              </button>
            </>
          )}
          <button
            onClick={handleOpenEmailModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'linear-gradient(to right, #3b82f6, #6366f1)',
              background: 'linear-gradient(to right, #3b82f6, #6366f1)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <FileText style={{height: '1rem', width: '1rem'}} />
            Send via Email
          </button>
          <button
            onClick={handleConvertToInvoice}
            disabled={converting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: converting ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(to right, #10b981, #14b8a6)',
              background: converting ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(to right, #10b981, #14b8a6)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: converting ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            <DollarSign style={{height: '1rem', width: '1rem'}} />
            {converting ? 'Converting...' : 'Convert to Invoice'}
          </button>
        </div>

        {/* Two Column Layout */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
          {/* Left Column - Services */}
          <div>
            <QuoteServices
              services={quote.items}
              onAddService={() => setShowAddServiceModal(true)}
              onEditService={handleEditServiceClick}
              onDeleteService={handleDeleteService}
            />
          </div>

          {/* Right Column - Contractors */}
          <div>
            <QuoteContractors
              contractors={assignedContractors}
              onAddContractor={() => setShowAddContractorModal(true)}
              onRemoveContractor={handleRemoveContractor}
              isDraft={quote?.status === 'draft'}
            />
          </div>
        </div>

        {/* Quote Details Section */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
            {/* Left Column */}
            <div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div>
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Notes:</span>
                  {isEditing ? (
                    <textarea
                      value={editData.notes}
                      onChange={(e) => handleEditDataChange('notes', e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        border: '2px solid rgba(59, 130, 246, 0.5)',
                        borderRadius: '0.25rem',
                        color: 'white',
                        outline: 'none',
                        resize: 'vertical',
                        marginTop: '0.25rem',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                        transition: 'all 0.2s'
                      }}
                      placeholder="Enter notes..."
                    />
                  ) : (
                    <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{quote.notes || 'No notes specified'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem'}}>
                <div>
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Subtotal:</span>
                  <p style={{color: 'white', margin: '0', fontWeight: '500'}}>${quote.subtotal.toFixed(2)}</p>
                </div>
                <div>
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Tax Rate:</span>
                  <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{quote.taxRate}%</p>
                </div>
                <div>
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Tax Amount:</span>
                  <p style={{color: 'white', margin: '0', fontWeight: '500'}}>${quote.taxAmount.toFixed(2)}</p>
                </div>
                <div>
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Total:</span>
                  <p style={{color: 'white', margin: '0', fontSize: '1.25rem', fontWeight: '600'}}>${quote.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Valid Until */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{marginBottom: '1.5rem'}}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>Terms & Conditions</h2>
            {isEditing ? (
              <textarea
                value={editData.terms}
                onChange={(e) => handleEditDataChange('terms', e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  border: '2px solid rgba(59, 130, 246, 0.5)',
                  borderRadius: '0.25rem',
                  color: 'white',
                  outline: 'none',
                  resize: 'vertical',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                  transition: 'all 0.2s'
                }}
                placeholder="Enter terms and conditions..."
              />
            ) : (
              <p style={{fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0}}>{quote.terms || 'No terms specified'}</p>
            )}
          </div>
          <div>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>Valid Until</h2>
            {isEditing ? (
              <input
                type="date"
                value={editData.validUntil}
                onChange={(e) => handleEditDataChange('validUntil', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  border: '2px solid rgba(59, 130, 246, 0.5)',
                  borderRadius: '0.25rem',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.875rem',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                  transition: 'all 0.2s'
                }}
              />
            ) : (
              <p style={{fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0}}>{new Date(quote.validUntil).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        {/* Delete Quote Button */}
        <div style={{marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}>
          <button
            onClick={handleDeleteQuote}
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
            Delete Quote
          </button>
        </div>

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
            setSelectedSkills([])
            setContractorHours(1)
            setContractorRateType('hourly')
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
          onEditContractor={() => {}}
          onEmailDataChange={handleEmailDataChange}
          onServiceFormChange={handleServiceFormChange}
          onSelectedContractorChange={setSelectedContractor}
          onResetTemplate={handleResetToTemplate}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview(!showPreview)}
          availableSkills={availableSkills}
          selectedSkills={selectedSkills}
          filteredContractors={filteredContractors}
          contractorRateType={contractorRateType}
          contractorHours={contractorHours}
          contractorCost={contractorCost}
          onToggleSkillFilter={toggleSkillFilter}
          onRateTypeChange={setContractorRateType}
          onHoursChange={setContractorHours}
        />
      </div>
    </div>
  )
}
