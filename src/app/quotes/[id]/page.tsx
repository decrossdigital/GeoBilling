'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Music, Home, Users, FileText, DollarSign, User, Settings, Edit, Save, X, Trash2, Send } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Header from '@/components/header'
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

interface QuoteContractor {
  id: string
  contractorId: string
  assignedSkills: string[]
  rateType: string
  hours: number | null
  cost: number
  includeInTotal: boolean
  notes?: string | null
  contractor: Contractor
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
  activityLog?: string
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
  const [contractorNotes, setContractorNotes] = useState('')
  const [assignedContractors, setAssignedContractors] = useState<QuoteContractor[]>([])
  const [availableServices, setAvailableServices] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showResendModal, setShowResendModal] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [converting, setConverting] = useState(false)
  const [resendValidUntil, setResendValidUntil] = useState('')
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)
  const [showSelectServiceModal, setShowSelectServiceModal] = useState(false)
  const [showAddContractorModal, setShowAddContractorModal] = useState(false)
  const [showEditContractorModal, setShowEditContractorModal] = useState(false)
  const [editingContractorId, setEditingContractorId] = useState<string | null>(null)
  const [editContractorRateType, setEditContractorRateType] = useState<'hourly' | 'flat'>('hourly')
  const [editContractorHours, setEditContractorHours] = useState<number | null>(1)
  const [editContractorCost, setEditContractorCost] = useState<number>(0)
  const [editContractorInclude, setEditContractorInclude] = useState<boolean>(true)
  const [editContractorNotes, setEditContractorNotes] = useState<string>('')
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
  const [currentApprovalToken, setCurrentApprovalToken] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [serviceForm, setServiceForm] = useState({
    serviceName: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    pricingType: 'flat' as 'hourly' | 'flat',
    taxable: false
  })
  const [showServiceForm, setShowServiceForm] = useState(false)
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

  // Fetch available services
  useEffect(() => {
    const fetchAvailableServices = async () => {
      try {
        const response = await fetch('/api/service-templates')
        if (response.ok) {
          const data = await response.json()
          setAvailableServices(data)
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }

    if (session) {
      fetchAvailableServices()
    }
  }, [session])

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
      // Use the approval token that was generated when the modal opened
      // If for some reason we don't have one, generate a new one
      let approvalToken = currentApprovalToken
      
      if (!approvalToken) {
        approvalToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
        setCurrentApprovalToken(approvalToken)
      }
      
      // Ensure the message has the correct approval URL (in case user edited it)
      const quoteUrl = `${window.location.origin}/quotes/${quoteId}`
      const approvalUrl = `${window.location.origin}/quote/${quoteId}/approve?token=${approvalToken}`
      
      // Replace any existing approval URL pattern with the correct one
      let processedMessage = emailData.message
      // Replace old approval URL patterns
      processedMessage = processedMessage.replace(/http[s]?:\/\/[^\s]+\/quote\/[^\/\s]+\/approve[^\s]*/g, approvalUrl)
      // Also replace if they just have the tokenless URL
      processedMessage = processedMessage.replace(/http[s]?:\/\/[^\s]+\/quote\/[^\/\s]+(\s|$)/g, `${approvalUrl}$1`)
      
      const response = await fetch('/api/quotes/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId: quoteId,
          to: emailData.to,
          subject: emailData.subject,
          message: processedMessage,
          approvalToken
        })
      })

      if (response.ok) {
        alert('Quote sent successfully!')
        setShowEmailModal(false)
        // Refetch the quote to get updated status from the server
        const quoteResponse = await fetch(`/api/quotes/${quoteId}`)
        if (quoteResponse.ok) {
          const updatedQuote = await quoteResponse.json()
          // Compute client name from firstName/lastName
          if (updatedQuote.client) {
            updatedQuote.client.name = getClientName(updatedQuote.client)
          }
          setQuote(updatedQuote)
        }
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

  const handleOpenResendModal = () => {
    if (!quote) return
    
    // Calculate original duration (validUntil - createdAt) in days
    const createdAt = new Date(quote.createdAt)
    const originalValidUntil = new Date(quote.validUntil)
    const originalDurationMs = originalValidUntil.getTime() - createdAt.getTime()
    const originalDurationDays = Math.round(originalDurationMs / (1000 * 60 * 60 * 24))
    
    // Set default validUntil to match original duration from today
    const newValidUntil = new Date()
    newValidUntil.setDate(newValidUntil.getDate() + originalDurationDays)
    setResendValidUntil(newValidUntil.toISOString().split('T')[0])
    
    setShowResendModal(true)
  }

  const handleResendQuote = async () => {
    if (!quote) return
    
    setSendingEmail(true)
    try {
      // Generate new approval token
      const approvalToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      
      // Load email templates
      const savedTemplates = localStorage.getItem('emailTemplates')
      const templates = savedTemplates ? JSON.parse(savedTemplates) : {
        quoteSubject: "Quote {{quoteNumber}} - {{project}}",
        quoteBody: "Dear {{clientName}},\n\nThank you for your interest in our services. We're pleased to present our quote for \"{{project}}\".\n\nQUOTE DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nQuote Number: {{quoteNumber}}\nValid Until: {{validUntil}}\nTotal Amount: ${{total}}\n\n{{servicesSection}}\n\n{{contractorsSection}}\n\nNOTES\n{{notes}}\n\nTERMS & CONDITIONS\n{{terms}}\n\nYou can view the complete quote, request modifications or accept it online at:\n{{approvalUrl}}\n\nIf you have any questions about this quote, please contact us at:\n{{companyEmail}} | {{companyPhone}}\n\nBest regards,\n{{companyName}}"
      }

      // Company settings
      const companySettings = {
        name: "Uniquitous Music",
        email: "george@uniquitousmusic.com",
        phone: "(609) 316-8080",
        address: ""
      }

      // Prepare quote data for template (use updated validUntil)
      const quoteForTemplate = {
        ...quote,
        id: quoteId, // Ensure id is included for template processor
        validUntil: resendValidUntil,
        items: quote.items || [],
        contractors: assignedContractors
      }

      const quoteUrl = `${window.location.origin}/quote/${quoteId}`
      const approvalUrl = `${window.location.origin}/quote/${quoteId}/approve?token=${approvalToken}`
      const termsUrl = `${window.location.origin}/terms`

      // Process email template
      const subject = processQuoteTemplate(
        templates.quoteSubject || "Quote {{quoteNumber}} - {{project}}",
        quoteForTemplate,
        companySettings,
        quoteUrl,
        assignedContractors,
        quote.total,
        approvalToken,
        termsUrl
      )

      const message = processQuoteTemplate(
        templates.quoteBody || "Dear {{clientName}},\n\nThank you for your interest in our services. We're pleased to present our quote for \"{{project}}\".\n\nQUOTE DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nQuote Number: {{quoteNumber}}\nValid Until: {{validUntil}}\nTotal Amount: ${{total}}\n\n{{servicesSection}}\n\n{{contractorsSection}}\n\nNOTES\n{{notes}}\n\nTERMS & CONDITIONS\n{{terms}}\n\nFor complete Terms & Conditions, please visit: {{termsUrl}}\n\nYou can view the complete quote, request modifications or accept it online at:\n{{approvalUrl}}\n\nIf you have any questions about this quote, please contact us at:\n{{companyEmail}} | {{companyPhone}}\n\nBest regards,\n{{companyName}}",
        quoteForTemplate,
        companySettings,
        quoteUrl,
        assignedContractors,
        quote.total,
        approvalToken,
        termsUrl
      )

      // Debug: Check if approval URL was generated
      console.log('Quote URL:', quoteUrl)
      console.log('Approval Token:', approvalToken)
      console.log('Expected Approval URL:', `${window.location.origin}/quote/${quoteId}/approve?token=${approvalToken}`)
      console.log('Message contains approval URL:', message.includes('/approve?token='))
      console.log('Message contains {{approvalUrl}}:', message.includes('{{approvalUrl}}'))
      
      // If approval URL wasn't generated, manually replace it
      let finalMessage = message
      if (message.includes('{{approvalUrl}}')) {
        console.warn('⚠ {{approvalUrl}} was not replaced! Manually replacing...')
        finalMessage = message.replace(/\{\{approvalUrl\}\}/g, `${window.location.origin}/quote/${quoteId}/approve?token=${approvalToken}`)
      } else if (!message.includes('/approve?token=')) {
        console.warn('⚠ Approval URL missing in processed message. Expected URL:', `${window.location.origin}/quote/${quoteId}/approve?token=${approvalToken}`)
        // Try to replace any /quote/[id] URLs with the approval URL
        finalMessage = message.replace(
          new RegExp(`${window.location.origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/quote/${quoteId}(?![/\\w])`, 'g'),
          `${window.location.origin}/quote/${quoteId}/approve?token=${approvalToken}`
        )
      } else {
        finalMessage = message
      }

      // Send email with resend flag and new validUntil
      const response = await fetch('/api/quotes/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId: quoteId,
          to: quote.client.email,
          subject: subject,
          message: finalMessage,
          approvalToken: approvalToken,
          validUntil: resendValidUntil,
          isResend: true
        })
      })

      if (response.ok) {
        alert('Quote resent successfully!')
        setShowResendModal(false)
        // Refetch the quote to get updated status
        const quoteResponse = await fetch(`/api/quotes/${quoteId}`)
        if (quoteResponse.ok) {
          const updatedQuote = await quoteResponse.json()
          if (updatedQuote.client) {
            updatedQuote.client.name = getClientName(updatedQuote.client)
          }
          setQuote(updatedQuote)
        }
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Failed to resend quote'
        alert(`Failed to resend quote: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error resending quote:', error)
      alert('Error resending quote')
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
          clientName: quote?.client ? getClientName(quote.client) : 'Unknown Client',
          clientEmail: quote?.client.email,
          clientPhone: quote?.client.phone,
          clientAddress: quote?.client.address,
          project: quote?.project,
          projectDescription: quote?.projectDescription,
          items: quote?.items,
          contractors: assignedContractors,
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
      quoteBody: "Dear {{clientName}},\n\nThank you for your interest in our services. We're pleased to present our quote for \"{{project}}\".\n\nQUOTE DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nQuote Number: {{quoteNumber}}\nValid Until: {{validUntil}}\nTotal Amount: ${{total}}\n\n{{servicesSection}}\n\n{{contractorsSection}}\n\nNOTES\n{{notes}}\n\nTERMS & CONDITIONS\n{{terms}}\n\nFor complete Terms & Conditions, please visit: {{termsUrl}}\n\nYou can view the complete quote, request modifications or accept it online at:\n{{approvalUrl}}\n\nIf you have any questions about this quote, please contact us at:\n{{companyEmail}} | {{companyPhone}}\n\nBest regards,\n{{companyName}}"
    }

    // Company settings (would come from settings in real app)
    const companySettings = {
      name: "Uniquitous Music",
      email: "george@uniquitousmusic.com",
      phone: "(609) 316-8080",
      address: "123 Music Studio Lane, NJ 08540"
    }

    const quoteUrl = `${window.location.origin}/quotes/${quoteId}`

    // Calculate grand total with contractor costs
    const contractorCostsTotal = assignedContractors
      .filter(c => c.includeInTotal)
      .reduce((sum, c) => sum + Number(c.cost), 0)
    const calculatedGrandTotal = Number(quote.total) + contractorCostsTotal

    // Generate approval token for this email
    const approvalToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    
    // Store the token so we can reuse it when sending
    setCurrentApprovalToken(approvalToken)

    // Process templates with approval token
    const termsUrl = `${window.location.origin}/terms`
    
    // Ensure quote object has id for template processor
    const quoteForTemplate = {
      ...quote,
      id: quoteId
    } as any
    
    const processedSubject = processQuoteTemplate(templates.quoteSubject, quoteForTemplate, companySettings, quoteUrl, assignedContractors, calculatedGrandTotal, approvalToken, termsUrl)
    let processedBody = processQuoteTemplate(templates.quoteBody, quoteForTemplate, companySettings, quoteUrl, assignedContractors, calculatedGrandTotal, approvalToken, termsUrl)

    // Debug: Check if approval URL was generated
    console.log('Email Modal - Quote URL:', quoteUrl)
    console.log('Email Modal - Approval Token:', approvalToken)
    console.log('Email Modal - Expected Approval URL:', `${window.location.origin}/quote/${quoteId}/approve?token=${approvalToken}`)
    console.log('Email Modal - Message contains approval URL:', processedBody.includes('/approve?token='))
    console.log('Email Modal - Message contains {{approvalUrl}}:', processedBody.includes('{{approvalUrl}}'))
    
    // Ensure approval URL is present - manually fix if template processor failed
    if (processedBody.includes('{{approvalUrl}}')) {
      console.warn('⚠ Email Modal - {{approvalUrl}} was not replaced! Manually replacing...')
      processedBody = processedBody.replace(/\{\{approvalUrl\}\}/g, `${window.location.origin}/quote/${quoteId}/approve?token=${approvalToken}`)
    } else if (!processedBody.includes('/approve?token=')) {
      console.warn('⚠ Email Modal - Approval URL missing. Replacing any /quote/[id] or /quotes/[id] URLs...')
      // Replace any /quote/[id] or /quotes/[id] URLs with the approval URL
      const urlPattern = new RegExp(`${window.location.origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/quote[s]?/${quoteId}(?![/\\w])`, 'g')
      processedBody = processedBody.replace(urlPattern, `${window.location.origin}/quote/${quoteId}/approve?token=${approvalToken}`)
    }

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
          includeInTotal: true,
          notes: contractorNotes || null
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
        setContractorNotes('')
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

  const handleToggleIncludeInTotal = async (contractorId: string, include: boolean) => {
    try {
      const contractor = assignedContractors.find(c => c.id === contractorId)
      if (!contractor) return

      const response = await fetch(`/api/quotes/${quoteId}/contractors/${contractorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedSkills: contractor.assignedSkills,
          rateType: contractor.rateType,
          hours: contractor.hours,
          cost: contractor.cost,
          includeInTotal: include,
          notes: contractor.notes || null
        })
      })
      
      if (response.ok) {
        const updated = await response.json()
        setAssignedContractors(assignedContractors.map(c => 
          c.id === contractorId ? updated : c
        ))
      } else {
        alert('Failed to update contractor')
      }
    } catch (error) {
      console.error('Error updating contractor:', error)
      alert('Error updating contractor')
    }
  }

  const handleSaveEditedContractor = async () => {
    if (!editingContractorId) return
    try {
      const contractor: any = assignedContractors.find(c => c.id === editingContractorId)
      if (!contractor) return
      const response = await fetch(`/api/quotes/${quoteId}/contractors/${editingContractorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedSkills: contractor.assignedSkills,
          rateType: editContractorRateType,
          hours: editContractorRateType === 'hourly' ? (editContractorHours ?? 1) : null,
          cost: Number(editContractorCost),
          includeInTotal: editContractorInclude,
          notes: editContractorNotes || null
        })
      })

      if (response.ok) {
        const updated = await response.json()
        setAssignedContractors(assignedContractors.map(c => c.id === editingContractorId ? updated : c))
        setShowEditContractorModal(false)
        setEditingContractorId(null)
      } else {
        alert('Failed to update contractor')
      }
    } catch (error) {
      console.error('Error updating contractor:', error)
      alert('Error updating contractor')
    }
  }

  const handleSelectService = async () => {
    if (!selectedService || !quote) return

    try {
      const service = availableServices.find(s => s.id === selectedService)
      if (!service) return

      const response = await fetch(`/api/quotes/${quoteId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: service.name,
          description: service.description,
          quantity: 1,
          unitPrice: Number(service.rate),
          total: Number(service.rate) * 1,
          taxable: false,
          serviceTemplateId: service.id
        })
      })

      if (response.ok) {
        const newItem = await response.json()
        const normalized = {
          ...newItem,
          quantity: Number(newItem.quantity ?? 1),
          unitPrice: Number(newItem.unitPrice ?? service.rate),
          total: Number(newItem.total ?? (Number(newItem.unitPrice ?? service.rate) * 1))
        }
        setQuote({
          ...quote,
          items: [...quote.items, normalized]
        })
        setShowSelectServiceModal(false)
        setSelectedService('')
        alert('Service added successfully!')
      } else {
        alert('Failed to add service')
      }
    } catch (error) {
      console.error('Error adding service:', error)
      alert('Error adding service')
    }
  }

  const handleSelectedServiceChange = (value: string) => {
    setSelectedService(value)
  }

  const handleDeleteService = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`/api/quotes/${quoteId}/items/${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Reload page to ensure UI updates with fresh data
        window.location.reload()
      } else {
        alert('Failed to delete service')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Error deleting service')
    }
  }

  const handleAddService = async () => {
    if (!serviceForm.serviceName.trim()) {
      alert('Please enter a service name')
      return
    }

    const total = serviceForm.quantity * serviceForm.unitPrice
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
          total: total,
          taxable: serviceForm.taxable,
          pricingType: serviceForm.pricingType
        })
      })

      if (response.ok) {
        setShowSelectServiceModal(false)
        setShowServiceForm(false)
        setServiceForm({ serviceName: '', description: '', quantity: 1, unitPrice: 0, pricingType: 'flat', taxable: false })
        // Reload page to ensure UI updates with fresh data
        window.location.reload()
      } else {
        alert('Failed to add service')
      }
    } catch (error) {
      console.error('Error adding service:', error)
      alert('Error adding service')
    }
  }

  const handleCustomServiceClick = () => {
    setServiceForm({ serviceName: '', description: '', quantity: 1, unitPrice: 0, pricingType: 'flat', taxable: false })
    setShowServiceForm(true)
  }

  const handleTemplateServiceClick = (service: any) => {
    setServiceForm({
      serviceName: service.name,
      description: service.description || '',
      quantity: 1,
      unitPrice: Number(service.rate) || 0,
      pricingType: service.pricingType || 'flat',
      taxable: false
    })
    setShowServiceForm(true)
    setSelectedService(service.id)
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
        setShowEditServiceModal(false)
        setEditingItem(null)
        setServiceForm({ serviceName: '', description: '', quantity: 1, unitPrice: 0, pricingType: 'flat', taxable: false })
        // Reload page to ensure UI updates with fresh data
        window.location.reload()
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

  // Calculate total with included contractor costs - useMemo to ensure recalculation on state changes
  // Must be before any conditional returns to follow Rules of Hooks
  const contractorCostsTotal = useMemo(() => {
    return assignedContractors
      .filter(c => c.includeInTotal)
      .reduce((sum, c) => sum + Number(c.cost), 0)
  }, [assignedContractors])
  
  const grandTotal = useMemo(() => {
    if (!quote) return 0
    return Number(quote.total) + contractorCostsTotal
  }, [quote?.total, contractorCostsTotal])

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
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0f172a 100%)', color: 'white'}}>
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem'}}>
        {/* Header */}
        <Header />
        
        {/* Navigation */}
        <Navigation />


        {/* Back to Quotes Link */}
        <div style={{marginBottom: '2rem'}}>
          <Link href="/quotes" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', textDecoration: 'none', fontSize: '0.875rem'}}>
            <ArrowLeft style={{height: '1rem', width: '1rem'}} />
            Back to Quotes
          </Link>
        </div>

        {/* Quote Details */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem'}}>
          <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Quote Details</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
            <div>
              <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Created:</span>
              <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{new Date(quote.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Valid Until:</span>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.validUntil}
                  onChange={(e) => handleEditDataChange('validUntil', e.target.value)}
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
                />
              ) : (
                <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{new Date(quote.validUntil).toLocaleDateString()}</p>
              )}
            </div>
            <div>
              <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Total:</span>
              <p style={{color: 'white', margin: '0', fontWeight: '500', fontSize: '1.125rem'}}>${grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Quote Header with Client Information */}
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
            
            {/* Status Badge and Send Again Button */}
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.2)'}}>
                <div style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '50%',
                  backgroundColor: quote.status === 'draft' ? '#6b7280' : 
                                 quote.status === 'sent' ? '#3b82f6' : 
                                 quote.status === 'accepted' ? '#10b981' : 
                                 quote.status === 'rejected' ? '#ef4444' : 
                                 quote.status === 'expired' ? '#f59e0b' : '#6b7280'
                }} />
                <span style={{color: 'white', fontWeight: '500', textTransform: 'capitalize'}}>{quote.status}</span>
              </div>
              {(quote.status === 'sent' || quote.status === 'expired') && (
                <button
                  onClick={handleOpenResendModal}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    borderRadius: '0.5rem',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}
                >
                  <Send style={{height: '0.875rem', width: '0.875rem'}} />
                  Send Again
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap'}}>
          {(quote.status === 'draft' || quote.status === 'sent' || quote.status === 'rejected') && !isEditing ? (
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
          ) : (quote.status === 'draft' || quote.status === 'sent' || quote.status === 'rejected') && isEditing ? (
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
          ) : null}
          {(quote.status === 'draft' || quote.status === 'rejected') && (
            <>
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
            </>
          )}
        </div>

        {/* Two Column Layout */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
          {/* Left Column - Services */}
          <div>
            <QuoteServices
              services={quote.items as any}
              onAddService={() => setShowAddServiceModal(true)}
              onSelectService={() => setShowSelectServiceModal(true)}
              onEditService={handleEditServiceClick as any}
              onDeleteService={handleDeleteService}
              isEditable={quote.status === 'draft' || quote.status === 'sent' || quote.status === 'rejected'}
            />
          </div>

          {/* Right Column - Contractors */}
          <div>
            <QuoteContractors
              contractors={assignedContractors}
              onAddContractor={() => setShowAddContractorModal(true)}
              onEditContractor={(contractorId) => {
                const c: any = assignedContractors.find((x: any) => x.id === contractorId)
                if (!c) return
                setEditingContractorId(contractorId)
                setEditContractorRateType((c.rateType as 'hourly' | 'flat') || 'hourly')
                setEditContractorHours(c.hours ?? null)
                setEditContractorCost(Number(c.cost) || 0)
                setEditContractorInclude(!!c.includeInTotal)
                setEditContractorNotes(c.notes || '')
                setShowEditContractorModal(true)
              }}
              onRemoveContractor={handleRemoveContractor}
              onToggleIncludeInTotal={handleToggleIncludeInTotal}
              isDraft={quote.status === 'draft' || quote.status === 'sent' || quote.status === 'rejected'}
            />
          </div>
        </div>

        {/* Notes and Totals Section */}
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
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'}}>
                <div>
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Subtotal:</span>
                  <p style={{color: 'white', margin: '0', fontWeight: '500'}}>${Number(quote.subtotal).toFixed(2)}</p>
                </div>
                {contractorCostsTotal > 0 && (
                  <div>
                    <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Contractors:</span>
                    <p style={{color: 'white', margin: '0', fontWeight: '500'}}>${contractorCostsTotal.toFixed(2)}</p>
                  </div>
                )}
                <div>
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Tax Rate:</span>
                  <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{quote.taxRate}%</p>
                </div>
                <div>
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Tax Amount:</span>
                  <p style={{color: 'white', margin: '0', fontWeight: '500'}}>${Number(quote.taxAmount).toFixed(2)}</p>
                </div>
                <div>
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Total:</span>
                  <p style={{color: 'white', margin: '0', fontSize: '1.25rem', fontWeight: '600'}}>${grandTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Contractor Modal */}
        {showEditContractorModal && editingContractorId && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#1e293b', borderRadius: '12px', padding: '30px', width: '90%', maxWidth: '650px',
              maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: '0 0 1rem 0' }}>Edit Contractor</h3>

              {/* Rate Type */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>Rate Type:</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', cursor: 'pointer' }}>
                    <input type="radio" value="hourly" checked={editContractorRateType === 'hourly'} onChange={(e) => setEditContractorRateType(e.target.value as 'hourly' | 'flat')} />
                    Hourly Rate
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', cursor: 'pointer' }}>
                    <input type="radio" value="flat" checked={editContractorRateType === 'flat'} onChange={(e) => setEditContractorRateType(e.target.value as 'hourly' | 'flat')} />
                    Flat Rate
                  </label>
                </div>
              </div>

              {/* Hours */}
              {editContractorRateType === 'hourly' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>Hours:</label>
                  <input
                    type="number"
                    value={editContractorHours ?? 1}
                    min={0.5}
                    step={0.5}
                    onChange={(e) => setEditContractorHours(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', color: 'white' }}
                  />
                </div>
              )}

              {/* Cost */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>Cost:</label>
                <input
                  type="number"
                  value={editContractorCost}
                  min={0}
                  step={0.01}
                  onChange={(e) => setEditContractorCost(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', color: 'white' }}
                />
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>Notes:</label>
                <textarea
                  value={editContractorNotes}
                  onChange={(e) => setEditContractorNotes(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', color: 'white', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="Add notes about this contractor assignment..."
                />
              </div>

              {/* Include in total */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editContractorInclude} onChange={(e) => setEditContractorInclude(e.target.checked)} />
                  Include in total
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setShowEditContractorModal(false); setEditingContractorId(null) }}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditedContractor}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#9333ea', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Valid Until and Terms */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{marginBottom: '1.5rem'}}>
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
          <div>
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
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0, marginBottom: '0.75rem', whiteSpace: 'pre-wrap'}}>{quote.terms || 'No terms specified'}</p>
                {quote.terms && (
                  <Link 
                    href="/terms" 
                    target="_blank"
                    style={{
                      fontSize: '0.875rem',
                      color: '#60a5fa',
                      textDecoration: 'underline',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    View complete Terms & Conditions
                    <span style={{fontSize: '0.75rem'}}>↗</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Activity Log Section (Admin Only) */}
        {quote.activityLog && (
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
              {quote.activityLog}
            </div>
          </div>
        )}

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
        {/* Resend Quote Modal */}
        {showResendModal && quote && (
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
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem'}}>Resend Quote</h2>
              
              <div style={{marginBottom: '1.5rem'}}>
                <p style={{color: '#cbd5e1', marginBottom: '1rem'}}>
                  This will resend the quote to the client with a new expiration date and approval link.
                  {quote.status === 'expired' && ' The quote status will be updated to "sent" and the client will be able to accept and pay.'}
                </p>
                
                <label style={{display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem'}}>
                  Valid Until Date:
                </label>
                <input
                  type="date"
                  value={resendValidUntil}
                  onChange={(e) => setResendValidUntil(e.target.value)}
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
                <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem'}}>
                  Default: {new Date(resendValidUntil).toLocaleDateString()} (matches original duration from today)
                </p>
              </div>

              <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                <button
                  onClick={() => setShowResendModal(false)}
                  disabled={sendingEmail}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: sendingEmail ? 'not-allowed' : 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleResendQuote}
                  disabled={sendingEmail || !resendValidUntil}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: sendingEmail || !resendValidUntil ? 'rgba(59, 130, 246, 0.5)' : 'linear-gradient(to right, #3b82f6, #6366f1)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: sendingEmail || !resendValidUntil ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Send style={{height: '1rem', width: '1rem'}} />
                  {sendingEmail ? 'Sending...' : 'Resend Quote'}
                </button>
              </div>
            </div>
          </div>
        )}

        <QuoteModals
          showEmailModal={showEmailModal}
          showAddServiceModal={showAddServiceModal}
          showEditServiceModal={showEditServiceModal}
          showSelectServiceModal={showSelectServiceModal}
          showAddContractorModal={showAddContractorModal}
          showEditContractorModal={showEditContractorModal}
          sendingEmail={sendingEmail}
          contractors={contractors}
          selectedContractor={selectedContractor}
          editingItem={editingItem}
          serviceForm={serviceForm}
          emailData={emailData}
          availableServices={availableServices}
          selectedService={selectedService}
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
            setContractorNotes('')
          }}
          onCloseEditContractorModal={() => {
            setShowEditContractorModal(false)
            setEditingItem(null)
            setSelectedContractor('')
          }}
          onCloseSelectServiceModal={() => {
            setShowSelectServiceModal(false)
            setSelectedService('')
            setShowServiceForm(false)
            setServiceForm({ serviceName: '', description: '', quantity: 1, unitPrice: 0, pricingType: 'flat', taxable: false })
          }}
          onSendEmail={handleSendEmail}
          onAddService={handleAddService}
          onSelectService={handleSelectService}
          showServiceForm={showServiceForm}
          onCustomServiceClick={handleCustomServiceClick}
          onTemplateServiceClick={handleTemplateServiceClick}
          onEditService={handleEditService}
          onAssignContractor={handleAssignContractor}
          onEditContractor={() => {}}
          onEmailDataChange={handleEmailDataChange}
          onServiceFormChange={handleServiceFormChange}
          onSelectedContractorChange={setSelectedContractor}
          onSelectedServiceChange={handleSelectedServiceChange}
          onResetTemplate={handleResetToTemplate}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview(!showPreview)}
          availableSkills={availableSkills}
          selectedSkills={selectedSkills}
          filteredContractors={filteredContractors}
          contractorRateType={contractorRateType}
          contractorHours={contractorHours}
          contractorCost={contractorCost}
          contractorNotes={contractorNotes}
          onToggleSkillFilter={toggleSkillFilter}
          onRateTypeChange={setContractorRateType}
          onHoursChange={setContractorHours}
          onContractorNotesChange={setContractorNotes}
        />
      </div>
    </div>
  )
}
