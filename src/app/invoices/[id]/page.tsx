'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Music, Trash2, CreditCard, Edit, Save, X, Plus, Send, FileText } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Header from '@/components/header'

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
  notes?: string | null
  billedSeparately?: boolean
  billedSeparatelyAt?: string | null
  contractorFeePaymentToken?: string | null
  contractor: Contractor
}

interface Payment {
  id: string
  amount: number
  currency: string
  paymentMethod: string
  paymentReference: string | null
  status: string
  transactionId: string | null
  processedAt: string | null
  createdAt: string
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
  payments?: Payment[]
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
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    project: '',
    projectDescription: '',
    notes: '',
    terms: '',
    dueDate: ''
  })
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [availableServices, setAvailableServices] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)
  const [showSelectServiceModal, setShowSelectServiceModal] = useState(false)
  const [showAddContractorModal, setShowAddContractorModal] = useState(false)
  const [showEditContractorModal, setShowEditContractorModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null)
  const [editingContractorId, setEditingContractorId] = useState<string | null>(null)
  const [editContractorRateType, setEditContractorRateType] = useState<'hourly' | 'flat'>('hourly')
  const [editContractorHours, setEditContractorHours] = useState<number | null>(1)
  const [editContractorCost, setEditContractorCost] = useState<number>(0)
  const [editContractorInclude, setEditContractorInclude] = useState<boolean>(true)
  const [editContractorNotes, setEditContractorNotes] = useState<string>('')
  const [assignedContractors, setAssignedContractors] = useState<any[]>([])
  const [availableSkills, setAvailableSkills] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [filteredContractors, setFilteredContractors] = useState<Contractor[]>([])
  const [contractorRateType, setContractorRateType] = useState<'hourly' | 'flat'>('hourly')
  const [contractorHours, setContractorHours] = useState(1)
  const [contractorCost, setContractorCost] = useState(0)
  const [contractorNotes, setContractorNotes] = useState('')
  const [selectedContractor, setSelectedContractor] = useState('')
  const [showBillSeparatelyModal, setShowBillSeparatelyModal] = useState(false)
  const [billingContractor, setBillingContractor] = useState<any>(null)
  const [selectedContractorsForBilling, setSelectedContractorsForBilling] = useState<string[]>([])
  const [serviceForm, setServiceForm] = useState({
    serviceName: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    pricingType: 'flat' as 'hourly' | 'flat',
    taxable: false
  })
  const [showServiceForm, setShowServiceForm] = useState(false)

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice()
    }
  }, [invoiceId])

  // Fetch contractors from API
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const response = await fetch('/api/contractors')
        if (response.ok) {
          const data = await response.json()
          setContractors(data)
        } else {
          console.error('Failed to fetch contractors')
        }
      } catch (error) {
        console.error('Error fetching contractors:', error)
      }
    }

    fetchContractors()
  }, [])

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

    fetchAvailableServices()
  }, [])

  // Fetch assigned contractors
  useEffect(() => {
    const fetchAssignedContractors = async () => {
      if (!invoiceId) return
      
      try {
        const response = await fetch(`/api/invoices/${invoiceId}/contractors`)
        if (response.ok) {
          const data = await response.json()
          setAssignedContractors(data)
        }
      } catch (error) {
        console.error('Error fetching assigned contractors:', error)
      }
    }
    
    if (session && invoiceId) {
      fetchAssignedContractors()
    }
  }, [session, invoiceId])

  // Load available skills from localStorage
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

  // Filter contractors based on selected skills
  useEffect(() => {
    if (selectedSkills.length === 0) {
      setFilteredContractors(contractors)
    } else {
      const filtered = contractors.filter(contractor =>
        selectedSkills.every(skill => contractor.skills.includes(skill))
      )
      setFilteredContractors(filtered)
    }
  }, [contractors, selectedSkills])

  // Calculate contractor cost
  useEffect(() => {
    if (selectedContractor && contractorRateType) {
      const contractor = filteredContractors.find(c => c.id === selectedContractor)
      if (contractor) {
        if (contractorRateType === 'hourly') {
          setContractorCost(Number(contractor.hourlyRate || contractor.rate) * contractorHours)
        } else {
          setContractorCost(Number(contractor.flatRate || contractor.rate))
        }
      }
    }
  }, [selectedContractor, contractorRateType, contractorHours, filteredContractors])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
        setEditData({
          project: data.project || '',
          projectDescription: data.projectDescription || '',
          notes: data.notes || '',
          terms: data.terms || '',
          dueDate: data.dueDate || ''
        })
      } else {
        const errorData = await response.json()
        console.error('Error loading invoice:', errorData)
        setError(errorData.details || errorData.error || 'Failed to load invoice')
        if (errorData.fullError) {
          console.error('Full error details:', errorData.fullError)
        }
      }
    } catch (err: any) {
      console.error('Error fetching invoice:', err)
      setError(err.message || 'Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (invoice) {
      setEditData({
        project: invoice.project || '',
        projectDescription: invoice.projectDescription || '',
        notes: invoice.notes || '',
        terms: invoice.terms || '',
        dueDate: invoice.dueDate || ''
      })
    }
  }

  const handleEditDataChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveEdit = async () => {
    if (!invoice) return

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        const updatedInvoice = await response.json()
        setInvoice(updatedInvoice)
        setIsEditing(false)
        alert('Invoice updated successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to update invoice: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
      alert('Error updating invoice')
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

  const handleDeleteService = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/items/${itemId}`, {
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
      const response = await fetch(`/api/invoices/${invoiceId}/items`, {
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
      const response = await fetch(`/api/invoices/${invoiceId}/items/${editingItem.id}`, {
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

  const handleEditServiceClick = (item: InvoiceItem) => {
    setEditingItem(item)
    setServiceForm({
      serviceName: item.serviceName,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })
    setShowEditServiceModal(true)
  }

  const handleServiceFormChange = (field: string, value: string | number) => {
    setServiceForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectService = async () => {
    if (!selectedService || !invoice) return

    try {
      const service = availableServices.find(s => s.id === selectedService)
      if (!service) return

      const response = await fetch(`/api/invoices/${invoiceId}/items`, {
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
        setInvoice({
          ...invoice,
          items: [...invoice.items, normalized]
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

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const handleContractorSelect = (contractorId: string) => {
    console.log('Selecting contractor:', contractorId)
    setSelectedContractor(contractorId)
    const contractor = contractors.find(c => c.id === contractorId)
    console.log('Found contractor:', contractor)
    if (contractor) {
      const rate = contractorRateType === 'hourly' 
        ? (contractor.hourlyRate || contractor.rate)
        : (contractor.flatRate || contractor.rate)
      console.log('Calculated rate:', rate, 'Rate type:', contractorRateType)
      setContractorCost(Number(rate))
    }
  }

  const handleAssignContractor = async () => {
    if (!selectedContractor || !selectedSkills.length) return

    console.log('Assigning contractor:', {
      selectedContractor,
      selectedSkills,
      contractorRateType,
      contractorHours,
      contractorCost,
      invoiceId
    })

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/contractors`, {
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

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const newAssignment = await response.json()
        console.log('New assignment:', newAssignment)
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
        console.error('Error response:', errorData)
        console.error('Full error details:', JSON.stringify(errorData, null, 2))
        const errorMessage = errorData.details || errorData.error || 'Unknown error'
        alert(`Failed to assign contractor: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error assigning contractor:', error)
      alert('Error assigning contractor')
    }
  }

  const handleRemoveContractor = async (contractorId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/contractors/${contractorId}`, {
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

  const handleToggleIncludeInTotal = async (contractorAssignmentId: string, include: boolean) => {
    try {
      const contractor = assignedContractors.find((c: any) => c.id === contractorAssignmentId)
      if (!contractor) return

      const response = await fetch(`/api/invoices/${invoiceId}/contractors/${contractorAssignmentId}`, {
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
        setAssignedContractors((prev: any[]) => prev.map((c: any) => c.id === contractorAssignmentId ? updated : c))
        // Remove from bulk billing selection if they're no longer included in total
        if (!include) {
          setSelectedContractorsForBilling(prev => prev.filter(id => id !== contractorAssignmentId))
        }
      } else {
        const err = await response.json()
        alert(err.error || 'Failed to update include in total')
      }
    } catch (error) {
      console.error('Error updating includeInTotal:', error)
      alert('Error updating include in total')
    }
  }

  const handleEditContractor = (contractorId: string) => {
    const c: any = assignedContractors.find((x: any) => x.id === contractorId)
    if (!c) return
    setEditingContractorId(contractorId)
    setEditContractorRateType((c.rateType as 'hourly' | 'flat') || 'hourly')
    setEditContractorHours(c.hours ?? null)
    setEditContractorCost(Number(c.cost) || 0)
    setEditContractorInclude(!!c.includeInTotal)
    setEditContractorNotes(c.notes || '')
    setShowEditContractorModal(true)
  }

  const handleSaveEditedContractor = async () => {
    if (!editingContractorId) return
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/contractors/${editingContractorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedSkills: (assignedContractors.find((c: any) => c.id === editingContractorId)?.assignedSkills) || [],
          rateType: editContractorRateType,
          hours: editContractorRateType === 'hourly' ? (editContractorHours ?? 1) : null,
          cost: editContractorRateType === 'hourly' ? Number(editContractorCost) : Number(editContractorCost),
          includeInTotal: editContractorInclude,
          notes: editContractorNotes || null
        })
      })

      if (response.ok) {
        const updated = await response.json()
        setAssignedContractors((prev: any[]) => prev.map((c: any) => c.id === editingContractorId ? updated : c))
        setShowEditContractorModal(false)
        setEditingContractorId(null)
        window.location.reload()
      } else {
        const err = await response.json()
        alert(err.error || 'Failed to update contractor')
      }
    } catch (error) {
      console.error('Error updating contractor:', error)
      alert('Error updating contractor')
    }
  }

  const handleBillSeparately = (contractor: any) => {
    setBillingContractor(contractor)
    setShowBillSeparatelyModal(true)
  }

  const handleSendBillSeparately = async () => {
    if (!billingContractor) return
    setProcessing(true)
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/contractors/${billingContractor.id}/bill-separately`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        alert('Contractor fee billing request sent successfully!')
        setShowBillSeparatelyModal(false)
        setBillingContractor(null)
        window.location.reload()
      } else {
        const err = await response.json()
        alert(err.error || 'Failed to send billing request')
      }
    } catch (error) {
      console.error('Error sending billing request:', error)
      alert('Error sending billing request')
    } finally {
      setProcessing(false)
    }
  }

  const handleToggleContractorSelection = (contractorId: string) => {
    setSelectedContractorsForBilling(prev => 
      prev.includes(contractorId)
        ? prev.filter(id => id !== contractorId)
        : [...prev, contractorId]
    )
  }

  const handleBulkBillSeparately = async () => {
    if (selectedContractorsForBilling.length === 0) {
      alert('Please select at least one contractor')
      return
    }
    setProcessing(true)
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/contractors/bulk-bill-separately`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractorIds: selectedContractorsForBilling })
      })

      if (response.ok) {
        alert(`Billing request sent successfully for ${selectedContractorsForBilling.length} contractor(s)!`)
        setSelectedContractorsForBilling([])
        window.location.reload() // Reload to update UI
      } else {
        const err = await response.json()
        alert(err.error || 'Failed to send bulk billing request')
      }
    } catch (error) {
      console.error('Error sending bulk billing request:', error)
      alert('Error sending bulk billing request')
    } finally {
      setProcessing(false)
    }
  }

  const handleSendInvoice = async () => {
    if (!invoice) return
    
    setProcessing(true)
    try {
      // Calculate grand total including contractor costs
      const contractorCostsTotal = assignedContractors
        .filter(c => c.includeInTotal)
        .reduce((sum, c) => sum + Number(c.cost), 0)
      const calculatedGrandTotal = Number(invoice.total) + contractorCostsTotal

      // Get client name
      const clientName = getClientName(invoice.client)
      const invoiceUrl = `${window.location.origin}/invoices/${invoiceId}`
      const termsUrl = `${window.location.origin}/terms`

      // Format payments for email template
      const paymentsForEmail = invoice.payments?.map(p => ({
        amount: Number(p.amount),
        paymentMethod: p.paymentMethod,
        paymentReference: p.paymentReference,
        transactionId: p.transactionId,
        processedAt: p.processedAt || null,
        createdAt: p.createdAt
      })) || []

      // Call send-email API with standard invoice email template
      const response = await fetch('/api/invoices/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoiceId,
          useStandardTemplate: true
        })
      })

      if (response.ok) {
        alert('Invoice sent successfully!')
        // Refetch the invoice to get updated status and activity log
        const invoiceResponse = await fetch(`/api/invoices/${invoiceId}`)
        if (invoiceResponse.ok) {
          const updatedInvoice = await invoiceResponse.json()
          setInvoice(updatedInvoice)
        }
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Failed to send invoice'
        alert(`Failed to send invoice: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error sending invoice:', error)
      alert('Error sending invoice')
    } finally {
      setProcessing(false)
    }
  }

  const handleResendInvoice = async () => {
    if (!invoice) return
    
    setProcessing(true)
    try {
      const response = await fetch('/api/invoices/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoiceId,
          isResend: true
        })
      })

      if (response.ok) {
        alert('Invoice resent successfully!')
        // Refetch the invoice to get updated activity log
        const invoiceResponse = await fetch(`/api/invoices/${invoiceId}`)
        if (invoiceResponse.ok) {
          const updatedInvoice = await invoiceResponse.json()
          setInvoice(updatedInvoice)
        }
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Failed to resend invoice'
        alert(`Failed to resend invoice: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error resending invoice:', error)
      alert('Error resending invoice')
    } finally {
      setProcessing(false)
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

  // Calculate total with included contractor costs - useMemo to ensure recalculation on state changes
  // Must be before any conditional returns to follow Rules of Hooks
  const contractorCostsTotal = useMemo(() => {
    return (assignedContractors || [])
      .filter((c: any) => c.includeInTotal)
      .reduce((sum: number, c: any) => sum + Number(c.cost), 0)
  }, [assignedContractors])
  
  const grandTotal = useMemo(() => {
    if (!invoice) return 0
    return Number(invoice.total) + contractorCostsTotal
  }, [invoice?.total, contractorCostsTotal])

  // Calculate payment totals
  const paymentsTotal = useMemo(() => {
    if (!invoice?.payments || invoice.payments.length === 0) return 0
    return invoice.payments
      .filter((p: Payment) => p.status === 'completed')
      .reduce((sum: number, p: Payment) => sum + p.amount, 0)
  }, [invoice?.payments])

  const balanceDue = useMemo(() => {
    return grandTotal - paymentsTotal
  }, [grandTotal, paymentsTotal])

  if (loading) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0f172a 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{color: 'white', textAlign: 'center'}}>
          <h2>Loading invoice...</h2>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0f172a 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{color: 'white', textAlign: 'center'}}>
          <h2>Error loading invoice</h2>
          <p>{error}</p>
        </div>
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

        {/* Back to Invoices Link */}
        <div style={{marginBottom: '2rem'}}>
          <Link href="/invoices" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', textDecoration: 'none', fontSize: '0.875rem'}}>
            <ArrowLeft style={{height: '1rem', width: '1rem'}} />
            Back to Invoices
          </Link>
        </div>

        {/* Invoice Details */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem'}}>
          <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Invoice Details</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
            <div>
              <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Issue Date:</span>
              <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{new Date(invoice.issueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Due Date:</span>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.dueDate}
                  onChange={(e) => handleEditDataChange('dueDate', e.target.value)}
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
                <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{new Date(invoice.dueDate).toLocaleDateString()}</p>
              )}
            </div>
            {invoice.paidDate && (
              <div>
                <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Paid Date:</span>
                <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{new Date(invoice.paidDate).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Subtotal:</span>
              <p style={{color: 'white', margin: '0', fontWeight: '500'}}>${Number(invoice.subtotal).toFixed(2)}</p>
            </div>
            <div>
              <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Tax ({(invoice.taxRate * 100).toFixed(0)}%):</span>
              <p style={{color: 'white', margin: '0', fontWeight: '500'}}>${Number(invoice.taxAmount).toFixed(2)}</p>
            </div>
            <div>
              <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Total:</span>
              <p style={{color: 'white', margin: '0', fontWeight: '500', fontSize: '1.125rem'}}>${grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Invoice Header with Client Information */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '2rem', marginBottom: '2rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div style={{flex: 1}}>
              <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>
                Invoice #{invoice.invoiceNumber}
              </h1>
              
              {/* Client and Project Information */}
              <div style={{marginBottom: '1.5rem'}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                  <div>
                    <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Name:</span>
                    <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{getClientName(invoice.client)}</p>
                  </div>
                  <div>
                    <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Email:</span>
                    <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{invoice.client.email}</p>
                  </div>
                  <div>
                    <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Phone:</span>
                    <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{invoice.client.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Address:</span>
                    <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{invoice.client.address || 'Not provided'}</p>
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
                      <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{invoice.project}</p>
                    )}
                  </div>
                  <div>
                    <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Project Description:</span>
                    {isEditing ? (
                      <textarea
                        value={editData.projectDescription}
                        onChange={(e) => handleEditDataChange('projectDescription', e.target.value)}
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
                          transition: 'all 0.2s',
                          resize: 'vertical',
                          minHeight: '60px'
                        }}
                        placeholder="Enter project description..."
                      />
                    ) : (
                      <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{invoice.projectDescription || 'No description provided'}</p>
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
                  backgroundColor: invoice.status === 'draft' ? '#6b7280' : 
                                 invoice.status === 'sent' ? '#3b82f6' : 
                                 invoice.status === 'paid' ? '#10b981' : 
                                 invoice.status === 'overdue' ? '#f59e0b' : 
                                 invoice.status === 'cancelled' ? '#ef4444' : '#6b7280'
                }} />
                <span style={{color: 'white', fontWeight: '500', textTransform: 'capitalize'}}>{invoice.status}</span>
              </div>
              {(invoice.status === 'sent' || invoice.status === 'paid' || invoice.status === 'overdue') && (
                <button
                  onClick={handleResendInvoice}
                  disabled={processing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    borderRadius: '0.5rem',
                    color: '#60a5fa',
                    cursor: processing ? 'not-allowed' : 'pointer',
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
          {invoice.status === 'draft' && !isEditing ? (
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
          ) : invoice.status === 'draft' && isEditing ? (
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
          {invoice.status === 'draft' && (
            <>
              <button
                onClick={handleSendInvoice}
                disabled={processing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: processing ? 'rgba(59, 130, 246, 0.5)' : 'linear-gradient(to right, #3b82f6, #6366f1)',
                  background: processing ? 'rgba(59, 130, 246, 0.5)' : 'linear-gradient(to right, #3b82f6, #6366f1)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                <FileText style={{height: '1rem', width: '1rem'}} />
                Send Invoice
              </button>
            </>
          )}
          {invoice.status === 'sent' && (
            <button
              onClick={handlePayInvoice}
              disabled={processing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: processing ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(to right, #10b981, #14b8a6)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: processing ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: processing ? 0.5 : 1
              }}
            >
              <CreditCard style={{height: '1rem', width: '1rem'}} />
              {processing ? 'Processing...' : `Pay $${grandTotal.toFixed(2)}`}
            </button>
          )}
        </div>

        {/* Two Column Layout */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
          {/* Left Column - Services */}
          <div>
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', margin: 0}}>
                  Services
                </h3>
                {invoice.status === 'draft' && (
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button
                      onClick={() => setShowSelectServiceModal(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '0.5rem',
                        color: '#60a5fa',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      Add Service
                    </button>
                  </div>
                )}
              </div>
              {invoice.items.length > 0 ? (
                invoice.items.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{flex: 1}}>
                      <p style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>{item.serviceName}</p>
                      {item.description && <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{item.description}</p>}
                      <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>
                        {Number(item.quantity)} × ${Number(item.unitPrice).toFixed(2)}
                        {item.taxable && <span style={{color: '#10b981', marginLeft: '0.5rem'}}>Taxable</span>}
                      </p>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      <p style={{fontWeight: 'bold'}}>${Number(item.total).toFixed(2)}</p>
                      {invoice.status === 'draft' && (
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button
                            onClick={() => handleEditServiceClick(item)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: 'rgba(59, 130, 246, 0.2)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '0.25rem',
                              color: '#60a5fa',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(item.id)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '0.25rem',
                              color: '#f87171',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{color: '#cbd5e1', textAlign: 'center', padding: '2rem'}}>No services added</p>
              )}
            </div>
          </div>

          {/* Right Column - Contractors */}
          <div>
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', margin: 0}}>
                  Contractors
                </h3>
                {invoice.status === 'draft' && (
                  <button
                    onClick={() => setShowAddContractorModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(to right, #9333ea, #c026d3)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    <Plus style={{height: '1rem', width: '1rem'}} />
                    Add Contractor
                  </button>
                )}
              </div>
              {assignedContractors.length > 0 ? (
                <>
                  {assignedContractors.map((ic, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{flex: 1, display: 'flex', gap: '0.75rem'}}>
                        {/* Checkbox for bulk billing (only for drafts, eligible contractors - not funded) */}
                        {invoice.status === 'draft' && ic.includeInTotal && !ic.billedSeparately && (
                          <div style={{display: 'flex', alignItems: 'flex-start', paddingTop: '0.25rem'}}>
                            <input
                              type="checkbox"
                              checked={selectedContractorsForBilling.includes(ic.id)}
                              onChange={() => handleToggleContractorSelection(ic.id)}
                              style={{ cursor: 'pointer', width: '1rem', height: '1rem' }}
                            />
                          </div>
                        )}
                        <div style={{flex: 1}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem'}}>
                            <p style={{fontWeight: 'bold', margin: 0}}>{ic.contractor.name}</p>
                            {/* Funded badge - shown when contractor is funded (billed separately AND payment completed) */}
                            {ic.billedSeparately && !ic.includeInTotal && (
                              <span style={{
                                padding: '0.125rem 0.5rem',
                                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#60a5fa'
                              }}>
                                Funded
                              </span>
                            )}
                          </div>
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
                            {!ic.includeInTotal && !ic.billedSeparately && <span style={{color: '#f59e0b', marginLeft: '0.5rem'}}>(Not included in total)</span>}
                          </p>
                          {ic.notes && (
                            <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', fontStyle: 'italic'}}>
                              {ic.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem'}}>
                        <p style={{fontWeight: 'bold'}}>${Number(ic.cost).toFixed(2)}</p>
                        {/* Only show editing controls for draft invoices and non-funded contractors */}
                        {invoice.status === 'draft' && !(ic.billedSeparately && !ic.includeInTotal) && (
                          <>
                            <label style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              cursor: ic.billedSeparately && ic.includeInTotal ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem',
                              color: ic.billedSeparately && ic.includeInTotal ? '#6b7280' : '#cbd5e1',
                              opacity: ic.billedSeparately && ic.includeInTotal ? 0.5 : 1
                            }}>
                              <input
                                type="checkbox"
                                checked={!!ic.includeInTotal}
                                onChange={(e) => handleToggleIncludeInTotal(ic.id, e.target.checked)}
                                disabled={ic.billedSeparately && ic.includeInTotal}
                                style={{ cursor: ic.billedSeparately && ic.includeInTotal ? 'not-allowed' : 'pointer' }}
                              />
                              <span>Include in total</span>
                            </label>
                            <div style={{display: 'flex', gap: '0.5rem'}}>
                            <button
                              onClick={() => handleEditContractor(ic.id)}
                              disabled={ic.billedSeparately && !ic.includeInTotal}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.25rem 0.5rem',
                                backgroundColor: ic.billedSeparately && !ic.includeInTotal ? 'rgba(107, 114, 128, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                color: ic.billedSeparately && !ic.includeInTotal ? '#6b7280' : '#60a5fa',
                                border: `1px solid ${ic.billedSeparately && !ic.includeInTotal ? 'rgba(107, 114, 128, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                                borderRadius: '0.25rem',
                                cursor: ic.billedSeparately && !ic.includeInTotal ? 'not-allowed' : 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                opacity: ic.billedSeparately && !ic.includeInTotal ? 0.5 : 1
                              }}
                            >
                              <Edit style={{height: '0.75rem', width: '0.75rem'}} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemoveContractor(ic.id)}
                              disabled={ic.billedSeparately && !ic.includeInTotal}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.25rem 0.5rem',
                                backgroundColor: ic.billedSeparately && !ic.includeInTotal ? 'rgba(107, 114, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: ic.billedSeparately && !ic.includeInTotal ? '#6b7280' : '#fca5a5',
                                border: `1px solid ${ic.billedSeparately && !ic.includeInTotal ? 'rgba(107, 114, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                borderRadius: '0.25rem',
                                cursor: ic.billedSeparately && !ic.includeInTotal ? 'not-allowed' : 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                opacity: ic.billedSeparately && !ic.includeInTotal ? 0.5 : 1
                              }}
                            >
                              <Trash2 style={{height: '0.75rem', width: '0.75rem'}} />
                              Remove
                            </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Bulk Bill Separately Button - Only for drafts */}
                  {invoice.status === 'draft' && assignedContractors.some((ic: any) => ic.includeInTotal && !ic.billedSeparately) && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      backgroundColor: 'rgba(147, 51, 234, 0.1)',
                      border: '1px solid rgba(147, 51, 234, 0.3)',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <p style={{color: '#cbd5e1', fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem'}}>
                          {selectedContractorsForBilling.length > 0 
                            ? `${selectedContractorsForBilling.length} contractor(s) selected`
                            : 'Select contractors to bill separately'
                          }
                        </p>
                        {selectedContractorsForBilling.length > 0 && (
                          <p style={{color: '#a78bfa', fontSize: '0.875rem', fontWeight: '500', margin: 0}}>
                            Total: ${assignedContractors
                              .filter((ic: any) => selectedContractorsForBilling.includes(ic.id))
                              .reduce((sum: number, ic: any) => sum + Number(ic.cost), 0)
                              .toFixed(2)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleBulkBillSeparately}
                        disabled={selectedContractorsForBilling.length === 0 || processing}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          backgroundColor: selectedContractorsForBilling.length > 0 && !processing ? 'rgba(147, 51, 234, 0.3)' : 'rgba(147, 51, 234, 0.1)',
                          color: selectedContractorsForBilling.length > 0 && !processing ? '#e9d5ff' : '#6b7280',
                          border: '1px solid rgba(147, 51, 234, 0.3)',
                          borderRadius: '0.5rem',
                          cursor: selectedContractorsForBilling.length > 0 && !processing ? 'pointer' : 'not-allowed',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          opacity: selectedContractorsForBilling.length > 0 && !processing ? 1 : 0.5
                        }}
                      >
                        {processing ? 'Processing...' : 'Bill Selected Contractors Separately'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p style={{color: '#cbd5e1', textAlign: 'center', padding: '2rem'}}>No contractors assigned</p>
              )}
            </div>
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
                    <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{invoice.notes || 'No notes specified'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'}}>
                <div>
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Subtotal:</span>
                  <p style={{color: 'white', margin: '0', fontWeight: '500'}}>${Number(invoice.subtotal).toFixed(2)}</p>
                </div>
                {contractorCostsTotal > 0 && (
                  <div>
                    <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Contractors:</span>
                    <p style={{color: 'white', margin: '0', fontWeight: '500'}}>${contractorCostsTotal.toFixed(2)}</p>
                  </div>
                )}
                <div>
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Tax Rate:</span>
                  <p style={{color: 'white', margin: '0', fontWeight: '500'}}>{invoice.taxRate}%</p>
                </div>
                <div>
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Tax Amount:</span>
                  <p style={{color: 'white', margin: '0', fontWeight: '500'}}>${Number(invoice.taxAmount).toFixed(2)}</p>
                </div>
                <div>
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Total:</span>
                  <p style={{color: 'white', margin: '0', fontSize: '1.25rem', fontWeight: '600'}}>${grandTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Section */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>
              Payment History
            </h2>
            <div style={{marginBottom: '1rem'}}>
              {invoice.payments
                .filter((p: Payment) => p.status === 'completed')
                .sort((a: Payment, b: Payment) => new Date(b.processedAt || b.createdAt).getTime() - new Date(a.processedAt || a.createdAt).getTime())
                .map((payment: Payment) => (
                  <div key={payment.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem'}}>
                        <span style={{color: '#10b981', fontSize: '0.875rem'}}>✓</span>
                        <p style={{color: 'white', margin: 0, fontWeight: '500', fontSize: '0.875rem'}}>
                          {payment.paymentMethod === 'stripe' ? 'Stripe' : 
                           payment.paymentMethod === 'paypal' ? 'PayPal' : 
                           payment.paymentMethod === 'check' ? 'Check' : 
                           payment.paymentMethod === 'cash' ? 'Cash' : 
                           payment.paymentMethod}
                        </p>
                        {payment.paymentReference && (
                          <span style={{color: '#94a3b8', fontSize: '0.75rem'}}>
                            - {payment.paymentReference}
                          </span>
                        )}
                      </div>
                      <p style={{color: '#94a3b8', margin: 0, fontSize: '0.75rem'}}>
                        {payment.processedAt 
                          ? new Date(payment.processedAt).toLocaleDateString()
                          : new Date(payment.createdAt).toLocaleDateString()}
                        {payment.transactionId && (
                          <span style={{marginLeft: '0.5rem'}}>• {payment.transactionId}</span>
                        )}
                      </p>
                    </div>
                    <p style={{color: '#10b981', margin: 0, fontWeight: 'bold'}}>
                      ${payment.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
            </div>
            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              paddingTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{color: '#cbd5e1', margin: 0, fontSize: '0.875rem'}}>Total Paid:</p>
                <p style={{color: '#10b981', margin: 0, fontSize: '1.125rem', fontWeight: '600'}}>
                  ${paymentsTotal.toFixed(2)}
                </p>
              </div>
              <div style={{textAlign: 'right'}}>
                <p style={{color: '#cbd5e1', margin: 0, fontSize: '0.875rem'}}>Balance Due:</p>
                <p style={{
                  color: balanceDue > 0 ? '#f59e0b' : '#10b981',
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 'bold'
                }}>
                  ${balanceDue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Due Date and Terms */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{marginBottom: '1.5rem'}}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>Due Date</h2>
            {isEditing ? (
              <input
                type="date"
                value={editData.dueDate}
                onChange={(e) => handleEditDataChange('dueDate', e.target.value)}
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
              <p style={{fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0}}>{new Date(invoice.dueDate).toLocaleDateString()}</p>
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
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0, marginBottom: '0.75rem', whiteSpace: 'pre-wrap'}}>{invoice.terms || 'No terms specified'}</p>
                {invoice.terms && (
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

        {/* Select Service Modal */}
        {showSelectServiceModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: '0 0 1rem 0' }}>
                Add Services
              </h3>

              {/* Custom Service Option */}
              <div style={{marginBottom: '1.5rem'}}>
                <h4 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '1rem'}}>Add Custom Service</h4>
                <div 
                  onClick={handleCustomServiceClick}
                  style={{
                    padding: '1rem', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    borderRadius: '0.5rem', 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <div style={{padding: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '0.5rem'}}>
                      <span style={{color: '#60a5fa', fontWeight: 700, fontSize: '1.25rem'}}>+</span>
                    </div>
                    <div>
                      <div style={{fontWeight: '500', color: 'white'}}>Custom Service</div>
                      <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Add a one-time service not in your templates</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Templates */}
              <div style={{marginBottom: '1.5rem'}}>
                <h4 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '1rem'}}>Available Services</h4>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
                  {availableServices.map((service) => {
                    return (
                      <div 
                        key={service.id} 
                        onClick={() => handleTemplateServiceClick(service)}
                        style={{
                          padding: '1rem', 
                          border: '1px solid rgba(255, 255, 255, 0.2)', 
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                          <div style={{padding: '0.5rem', backgroundColor: 'rgba(147, 51, 234, 0.2)', borderRadius: '0.5rem'}}>
                            <span style={{color: '#a78bfa', fontWeight: 700}}>•</span>
                          </div>
                          <div>
                            <div style={{fontWeight: '500', color: 'white'}}>{service.name}</div>
                            <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{service.description}</div>
                            <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>${service.rate}{service.pricingType === 'hourly' ? '/hour' : ''}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Service Form - shown when showServiceForm is true */}
              {showServiceForm && (
                <div style={{padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                      <div style={{flex: 1, marginRight: '1rem'}}>
                        <input
                          type="text"
                          placeholder="Enter service name"
                          value={serviceForm.serviceName}
                          onChange={(e) => handleServiceFormChange('serviceName', e.target.value)}
                          style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', marginBottom: '0.5rem'}}
                        />
                        <textarea
                          placeholder="Enter service description"
                          value={serviceForm.description}
                          onChange={(e) => handleServiceFormChange('description', e.target.value)}
                          rows={2}
                          style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', resize: 'vertical', fontFamily: 'inherit'}}
                        />
                      </div>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '1rem'}}>
                      <div>
                        <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Pricing Type</label>
                        <select
                          value={serviceForm.pricingType || 'flat'}
                          onChange={(e) => handleServiceFormChange('pricingType', e.target.value as 'hourly' | 'flat')}
                          style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                        >
                          <option value="flat">Flat Rate</option>
                          <option value="hourly">Per Hour</option>
                        </select>
                      </div>
                      <div>
                        <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>
                          {(serviceForm.pricingType || 'flat') === 'hourly' ? 'Hours' : 'Quantity'}
                        </label>
                        <input
                          type="number"
                          value={serviceForm.quantity}
                          onChange={(e) => handleServiceFormChange('quantity', parseInt(e.target.value) || 1)}
                          style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                        />
                      </div>
                      <div>
                        <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>
                          {(serviceForm.pricingType || 'flat') === 'hourly' ? 'Rate ($/hr)' : 'Rate ($)'}
                        </label>
                        <input
                          type="number"
                          value={serviceForm.unitPrice}
                          onChange={(e) => handleServiceFormChange('unitPrice', parseFloat(e.target.value) || 0)}
                          style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                        />
                      </div>
                      <div>
                        <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Taxable</label>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem'}}>
                          <input
                            type="checkbox"
                            checked={serviceForm.taxable || false}
                            onChange={(e) => handleServiceFormChange('taxable', e.target.checked)}
                            style={{width: '1rem', height: '1rem', accentColor: '#3b82f6'}}
                          />
                          <span style={{fontSize: '0.875rem', color: 'white'}}>Yes</span>
                        </div>
                      </div>
                      <div>
                        <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Amount</label>
                        <div style={{padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', fontWeight: '500'}}>
                          ${((serviceForm.quantity || 1) * (serviceForm.unitPrice || 0)).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem'}}>
                      <button
                        onClick={() => {
                          setShowSelectServiceModal(false)
                          setSelectedService('')
                          setShowServiceForm(false)
                          setServiceForm({ serviceName: '', description: '', quantity: 1, unitPrice: 0, pricingType: 'flat', taxable: false })
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddService}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        Add Service
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Contractor Modal */}
        {showAddContractorModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: '0 0 1rem 0' }}>
                Assign Contractor
              </h3>
              <p style={{ color: '#cbd5e1', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                Select skills needed and choose a contractor for this invoice
              </p>

              {/* Skills Filter */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>
                  Skills Needed:
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {availableSkills.map(skill => (
                    <label
                      key={skill}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        color: '#cbd5e1',
                        fontSize: '0.875rem'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => toggleSkillFilter(skill)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
                {selectedSkills.length > 0 && (
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Showing contractors with: {selectedSkills.join(', ')}
                  </p>
                )}
              </div>

              {/* Contractor Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>
                  Available Contractors ({filteredContractors.length}):
                </label>
                {selectedSkills.length === 0 ? (
                  <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#94a3b8',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <p style={{margin: 0, fontSize: '0.875rem'}}>
                      Please select skills above to see available contractors
                    </p>
                  </div>
                ) : (
                  <div style={{
                    maxHeight: '220px',
                    overflowY: 'auto',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }}>
                    {filteredContractors.length > 0 ? (
                    filteredContractors.map(contractor => (
                      <label
                        key={contractor.id}
                        style={{
                          display: 'block',
                          padding: '0.75rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          backgroundColor: selectedContractor === contractor.id ? 'rgba(147, 51, 234, 0.2)' : 'transparent',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedContractor !== contractor.id) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedContractor !== contractor.id) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="radio"
                            name="contractor"
                            value={contractor.id}
                            checked={selectedContractor === contractor.id}
                            onChange={(e) => handleContractorSelect(e.target.value)}
                            style={{ cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ color: 'white', fontWeight: '500', marginBottom: '0.25rem' }}>
                              {contractor.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              Skills: {contractor.skills.join(', ')}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              ${Number(contractor.hourlyRate || contractor.rate).toFixed(2)}/hr | ${Number(contractor.flatRate || contractor.rate).toFixed(2)} flat
                            </div>
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p style={{ padding: '1rem', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic', fontSize: '0.875rem' }}>
                      No contractors match selected skills
                    </p>
                  )}
                  </div>
                )}
              </div>

              {/* Rate Type and Hours */}
              {selectedContractor && (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>
                      Rate Type:
                    </label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          value="hourly"
                          checked={contractorRateType === 'hourly'}
                          onChange={(e) => {
                            console.log('Rate type changed to:', e.target.value)
                            setContractorRateType(e.target.value as 'hourly' | 'flat')
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        Hourly Rate
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          value="flat"
                          checked={contractorRateType === 'flat'}
                          onChange={(e) => {
                            console.log('Rate type changed to:', e.target.value)
                            setContractorRateType(e.target.value as 'hourly' | 'flat')
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        Flat Rate
                      </label>
                    </div>
                  </div>

                  {contractorRateType === 'hourly' && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>
                        Hours:
                      </label>
                      <input
                        type="number"
                        value={contractorHours}
                            onChange={(e) => {
                              console.log('Hours changed to:', e.target.value)
                              setContractorHours(Number(e.target.value))
                            }}
                        min="0.5"
                        step="0.5"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '0.5rem',
                          color: 'white',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>Notes:</label>
                    <textarea
                      value={contractorNotes}
                      onChange={(e) => setContractorNotes(e.target.value)}
                      rows={3}
                      style={{ width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', color: 'white', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                      placeholder="Add notes about this contractor assignment..."
                    />
                  </div>

                  {/* Cost Summary */}
                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(147, 51, 234, 0.1)',
                    border: '1px solid rgba(147, 51, 234, 0.3)',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <p style={{ color: '#e9d5ff', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      Assignment Summary:
                    </p>
                    <p style={{ color: 'white', fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {selectedSkills.join(', ')} - ${contractorCost.toFixed(2)}
                    </p>
                    <p style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>
                      {contractorRateType === 'hourly' 
                        ? `${contractorHours} hrs @ $${contractorHours > 0 ? (contractorCost / contractorHours).toFixed(2) : '0.00'}/hr`
                        : 'Flat rate'
                      }
                    </p>
                  </div>
                </>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowAddContractorModal(false)
                    setSelectedContractor('')
                    setSelectedSkills([])
                    setContractorHours(1)
                    setContractorRateType('hourly')
                    setContractorNotes('')
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignContractor}
                  disabled={!selectedContractor || selectedSkills.length === 0}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: selectedContractor && selectedSkills.length > 0 ? '#9333ea' : '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: selectedContractor && selectedSkills.length > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    opacity: selectedContractor && selectedSkills.length > 0 ? 1 : 0.5
                  }}
                >
                  Assign Contractor
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* Add Service Modal */}
        {showAddServiceModal && (
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
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem'}}>Add Service</h3>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem'}}>Service Name</label>
                  <input
                    type="text"
                    value={serviceForm.serviceName}
                    onChange={(e) => handleServiceFormChange('serviceName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none'
                    }}
                    placeholder="Enter service name"
                  />
                </div>
                
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem'}}>Description</label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => handleServiceFormChange('description', e.target.value)}
                    rows={3}
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
                    placeholder="Enter service description"
                  />
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem'}}>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={serviceForm.quantity}
                      onChange={(e) => handleServiceFormChange('quantity', parseInt(e.target.value) || 1)}
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
                    <label style={{display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem'}}>Unit Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={serviceForm.unitPrice}
                      onChange={(e) => handleServiceFormChange('unitPrice', parseFloat(e.target.value) || 0)}
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
                </div>
              </div>
              
              <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                <button
                  onClick={handleAddService}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'linear-gradient(to right, #10b981, #14b8a6)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Add Service
                </button>
                <button
                  onClick={() => {
                    setShowAddServiceModal(false)
                    setServiceForm({ serviceName: '', description: '', quantity: 1, unitPrice: 0 })
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Service Modal */}
        {showEditServiceModal && (
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
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem'}}>Edit Service</h3>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem'}}>Service Name</label>
                  <input
                    type="text"
                    value={serviceForm.serviceName}
                    onChange={(e) => handleServiceFormChange('serviceName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none'
                    }}
                    placeholder="Enter service name"
                  />
                </div>
                
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem'}}>Description</label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => handleServiceFormChange('description', e.target.value)}
                    rows={3}
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
                    placeholder="Enter service description"
                  />
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem'}}>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={serviceForm.quantity}
                      onChange={(e) => handleServiceFormChange('quantity', parseInt(e.target.value) || 1)}
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
                    <label style={{display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem'}}>Unit Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={serviceForm.unitPrice}
                      onChange={(e) => handleServiceFormChange('unitPrice', parseFloat(e.target.value) || 0)}
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
                </div>
              </div>
              
              <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                <button
                  onClick={handleEditService}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'linear-gradient(to right, #10b981, #14b8a6)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Update Service
                </button>
                <button
                  onClick={() => {
                    setShowEditServiceModal(false)
                    setEditingItem(null)
                    setServiceForm({ serviceName: '', description: '', quantity: 1, unitPrice: 0 })
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bill Separately Modal */}
        {showBillSeparatelyModal && billingContractor && (
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
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '500px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: '0 0 1rem 0'}}>
                Bill Contractor Separately
              </h3>
              
              <div style={{marginBottom: '1.5rem'}}>
                <p style={{color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '1rem'}}>
                  This will send a payment request email to the client for the contractor fee.
                </p>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <p style={{color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Contractor:</p>
                  <p style={{color: 'white', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                    {billingContractor.contractor.name}
                  </p>
                  <p style={{color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Skills:</p>
                  <p style={{color: 'white', marginBottom: '0.5rem'}}>
                    {billingContractor.assignedSkills.join(', ')}
                  </p>
                  {billingContractor.notes && (
                    <>
                      <p style={{color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Notes:</p>
                      <p style={{color: 'white', fontSize: '0.875rem', whiteSpace: 'pre-wrap'}}>
                        {billingContractor.notes}
                      </p>
                    </>
                  )}
                  <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Fee Amount:</span>
                    <span style={{color: '#9333ea', fontSize: '1.25rem', fontWeight: 'bold'}}>
                      ${Number(billingContractor.cost).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                <button
                  onClick={() => {
                    setShowBillSeparatelyModal(false)
                    setBillingContractor(null)
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendBillSeparately}
                  disabled={processing}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: processing ? '#6b7280' : '#9333ea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    opacity: processing ? 0.5 : 1
                  }}
                >
                  {processing ? 'Sending...' : 'Send Payment Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}