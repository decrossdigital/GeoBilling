"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import UserMenu from "@/components/user-menu"
import { ArrowLeft, Save, Send, ChevronRight, ChevronLeft, Plus, Trash2, Music, Headphones, Mic, Home, FileText, Users, BarChart3, Settings, User, Loader2 } from "lucide-react"

interface Client {
  id: string
  name: string
  email: string
  company: string
  phone?: string
  address?: string
}

interface ServiceTemplate {
  id: string
  name: string
  description: string
  category: string
  pricingType: 'hourly' | 'flat'
  rate: number
  icon?: any
}

interface QuoteItem {
  id: string
  serviceName: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  taxable: boolean
  pricingType?: 'hourly' | 'flat'
}

interface Contractor {
  id: string
  name: string
  email: string
  specialty: string
  pricingType: "hourly" | "flat"
  rate: number
}

interface QuoteContractor {
  id: string
  contractorId: string
  contractorName: string
  specialty: string
  paymentType: "hourly" | "flat"
  hours?: number
  rate: number
  amount: number
}

export default function EditQuotePage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const quoteId = params?.id as string
  
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [quoteContractors, setQuoteContractors] = useState<QuoteContractor[]>([])
  const [quoteNotes, setQuoteNotes] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [project, setProject] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>([])

  // Fetch existing quote data
  useEffect(() => {
    const fetchQuote = async () => {
      if (!session || !quoteId) return
      
      try {
        const response = await fetch(`/api/quotes/${quoteId}`)
        if (response.ok) {
          const quote = await response.json()
          
          // Check if quote is a draft
          if (quote.status !== 'draft') {
            alert('Only draft quotes can be edited')
            router.push(`/quotes/${quoteId}`)
            return
          }
          
          // Set client
          setSelectedClient({
            id: quote.client.id,
            name: quote.client.name,
            email: quote.client.email,
            company: quote.client.company || '',
            phone: quote.client.phone,
            address: quote.client.address
          })
          
          // Set quote items
          const items = quote.items
            .filter((item: any) => !item.contractorId)
            .map((item: any) => ({
              id: item.id,
              serviceName: item.serviceName,
              description: item.description || '',
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              total: Number(item.total),
              taxable: item.taxable,
              pricingType: item.pricingType || 'flat'
            }))
          setQuoteItems(items)
          
          // Set contractors
          const contractorItems = quote.items
            .filter((item: any) => item.contractorId)
            .map((item: any) => ({
              id: item.id,
              contractorId: item.contractorId,
              contractorName: item.serviceName,
              specialty: item.contractor?.specialty || '',
              paymentType: (item.pricingType || 'hourly') as 'hourly' | 'flat',
              hours: item.pricingType === 'hourly' ? Number(item.quantity) : undefined,
              rate: Number(item.unitPrice),
              amount: Number(item.total)
            }))
          setQuoteContractors(contractorItems)
          
          // Set other fields
          setQuoteNotes(quote.notes || '')
          setValidUntil(quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : '')
          setProject(quote.project || '')
          setProjectDescription(quote.projectDescription || '')
          
          setLoading(false)
        } else {
          console.error('Failed to fetch quote')
          router.push('/quotes')
        }
      } catch (error) {
        console.error('Error fetching quote:', error)
        router.push('/quotes')
      }
    }

    fetchQuote()
  }, [session, quoteId, router])

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      if (!session) return
      
      try {
        const response = await fetch('/api/clients')
        if (response.ok) {
          const data = await response.json()
          setClients(data)
        }
        // Clients list is optional for editing (client is already selected)
      } catch (error) {
        // Clients list is optional for editing, silently ignore errors
      }
    }

    fetchClients()
  }, [session])

  // Fetch contractors from API
  useEffect(() => {
    const fetchContractors = async () => {
      if (!session) return
      
      try {
        const response = await fetch('/api/contractors')
        if (response.ok) {
          const data = await response.json()
          setContractors(data)
        }
        // Contractors list is optional for editing
      } catch (error) {
        // Contractors list is optional for editing, silently ignore errors
      }
    }

    fetchContractors()
  }, [session])

  // Fetch service templates from API
  useEffect(() => {
    const fetchServiceTemplates = async () => {
      if (!session) return
      
      try {
        const response = await fetch('/api/services')
        if (response.ok) {
          const data = await response.json()
          const templates = data.map((service: any) => ({
            id: service.id,
            name: service.name,
            description: service.description || '',
            category: service.category || 'General',
            pricingType: service.pricingType || 'flat',
            rate: service.rate || 0
          }))
          setServiceTemplates(templates)
        }
        // Service templates are optional for editing, no need to show errors
      } catch (error) {
        // Service templates are optional for editing, silently ignore errors
      }
    }

    fetchServiceTemplates()
  }, [session])

  const addQuoteItem = () => {
    setQuoteItems([...quoteItems, {
      id: Math.random().toString(36).substr(2, 9),
      serviceName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      taxable: false,
      pricingType: 'flat'
    }])
  }

  const removeQuoteItem = (id: string) => {
    setQuoteItems(quoteItems.filter(item => item.id !== id))
  }

  const updateQuoteItem = (id: string, field: keyof QuoteItem, value: any) => {
    setQuoteItems(quoteItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        // Recalculate total - ensure values are numbers
        if (field === 'quantity' || field === 'unitPrice') {
          const quantity = Number(updatedItem.quantity) || 0
          const unitPrice = Number(updatedItem.unitPrice) || 0
          updatedItem.total = quantity * unitPrice
        }
        return updatedItem
      }
      return item
    }))
  }

  const addContractor = () => {
    setQuoteContractors([...quoteContractors, {
      id: Math.random().toString(36).substr(2, 9),
      contractorId: '',
      contractorName: '',
      specialty: '',
      paymentType: 'hourly',
      hours: 0,
      rate: 0,
      amount: 0
    }])
  }

  const removeContractor = (id: string) => {
    setQuoteContractors(quoteContractors.filter(contractor => contractor.id !== id))
  }

  const updateContractor = (id: string, field: keyof QuoteContractor, value: any) => {
    setQuoteContractors(quoteContractors.map(contractor => {
      if (contractor.id === id) {
        const updatedContractor = { ...contractor, [field]: value }
        // Recalculate amount - ensure values are numbers
        if (field === 'hours' || field === 'rate') {
          const hours = Number(updatedContractor.hours) || 0
          const rate = Number(updatedContractor.rate) || 0
          updatedContractor.amount = hours * rate
        }
        return updatedContractor
      }
      return contractor
    }))
  }

  const selectContractor = (quoteContractorId: string, contractorId: string) => {
    const selectedContractor = contractors.find(c => c.id === contractorId)
    if (selectedContractor) {
      updateContractor(quoteContractorId, 'contractorId', contractorId)
      updateContractor(quoteContractorId, 'contractorName', selectedContractor.name)
      updateContractor(quoteContractorId, 'specialty', selectedContractor.specialty)
      updateContractor(quoteContractorId, 'rate', selectedContractor.rate)
      updateContractor(quoteContractorId, 'paymentType', selectedContractor.pricingType)
    }
  }

  const handleUpdateQuote = async (status: 'draft' | 'sent') => {
    if (!selectedClient) {
      alert('Please select a client first')
      return
    }

    try {
      const servicesTotal = quoteItems.reduce((sum, item) => sum + item.total, 0)
      const contractorsTotal = quoteContractors.reduce((sum, contractor) => sum + contractor.amount, 0)
      const subtotal = servicesTotal + contractorsTotal
      const taxableAmount = quoteItems.reduce((sum, item) => sum + (item.taxable ? item.total : 0), 0)
      const taxRate = 8 // 8% tax
      const taxAmount = taxableAmount * (taxRate / 100)
      const total = subtotal + taxAmount

      const defaultValidUntil = validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      // Delete all existing items
      const existingQuote = await fetch(`/api/quotes/${quoteId}`)
      if (existingQuote.ok) {
        const quoteData = await existingQuote.json()
        for (const item of quoteData.items) {
          await fetch(`/api/quotes/${quoteId}/items/${item.id}`, {
            method: 'DELETE'
          })
        }
      }

      // Update quote basic info
      await fetch(`/api/quotes/${quoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Quote for ${selectedClient.name}`,
          description: "Professional music production services",
          project: project,
          projectDescription: projectDescription,
          status: status,
          validUntil: defaultValidUntil,
          notes: quoteNotes,
          terms: "Payment due within 30 days"
        })
      })

      // Add all items back
      const allItems = [
        ...quoteItems.map(item => ({
          serviceName: item.serviceName,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          taxable: item.taxable,
          pricingType: item.pricingType
        })),
        ...quoteContractors.map(contractor => ({
          serviceName: contractor.contractorName,
          description: contractor.specialty,
          quantity: contractor.paymentType === 'hourly' ? (contractor.hours || 0) : 1,
          unitPrice: contractor.rate,
          total: contractor.amount,
          taxable: false,
          contractorId: contractor.contractorId,
          pricingType: contractor.paymentType
        }))
      ]

      for (const item of allItems) {
        await fetch(`/api/quotes/${quoteId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        })
      }

      if (status === 'sent') {
        alert('Quote updated and sent successfully!')
      } else {
        alert('Quote updated as draft!')
      }
      router.push(`/quotes/${quoteId}`)
    } catch (error) {
      console.error('Error updating quote:', error)
      alert('Error updating quote')
    }
  }

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const steps = [
    { number: 1, title: "Add Services", description: "Select services and set pricing" },
    { number: 2, title: "Add Contractors", description: "Select contractors and payment terms" },
    { number: 3, title: "Review & Send", description: "Review quote details and send to client" }
  ]

  const servicesTotal = quoteItems.reduce((sum, item) => sum + item.total, 0)
  const contractorsTotal = quoteContractors.reduce((sum, contractor) => sum + contractor.amount, 0)
  const subtotal = servicesTotal + contractorsTotal
  const taxableAmount = quoteItems.reduce((sum, item) => sum + (item.taxable ? item.total : 0), 0)
  const taxAmount = taxableAmount * 0.08 // 8% tax on taxable items only
  const totalAmount = subtotal + taxAmount

  if (loading) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <Loader2 style={{height: '3rem', width: '3rem', color: '#a78bfa', margin: '0 auto', animation: 'spin 1s linear infinite'}} />
          <p style={{marginTop: '1rem', color: '#cbd5e1'}}>Loading quote...</p>
        </div>
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
          <UserMenu />
        </div>

        {/* Navigation */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '2rem'}}>
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <Link href="/" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
              <Home style={{height: '1rem', width: '1rem'}} />
              <span>Dashboard</span>
            </Link>
            <Link href="/clients" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
              <Users style={{height: '1rem', width: '1rem'}} />
              <span>Clients</span>
            </Link>
            <Link href="/contractors" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
              <User style={{height: '1rem', width: '1rem'}} />
              <span>Contractors</span>
            </Link>
            <Link href="/quotes" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'linear-gradient(to right, #9333ea, #3b82f6)', color: 'white', textDecoration: 'none', fontWeight: '500', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}>
              <FileText style={{height: '1rem', width: '1rem'}} />
              <span>Quotes</span>
            </Link>
            <Link href="/invoices" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
              <BarChart3 style={{height: '1rem', width: '1rem'}} />
              <span>Invoices</span>
            </Link>
            <Link href="/services" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
              <Settings style={{height: '1rem', width: '1rem'}} />
              <span>Services</span>
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div style={{marginBottom: '2rem'}}>
          <Link href={`/quotes/${quoteId}`} style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', textDecoration: 'none', fontSize: '0.875rem'}}>
            <ArrowLeft style={{height: '1rem', width: '1rem'}} />
            Back to Quote
          </Link>
        </div>

        {/* Page Header */}
        <div style={{marginBottom: '2rem'}}>
          <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white'}}>Edit Quote</h1>
          <p style={{color: '#cbd5e1'}}>Update quote details and send to client</p>
        </div>

        {/* Progress Steps */}
        <div style={{marginBottom: '3rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', position: 'relative'}}>
            {steps.map((step, index) => (
              <div key={step.number} style={{flex: 1, position: 'relative'}}>
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '1.5rem',
                      left: '50%',
                      width: '100%',
                      height: '2px',
                      background: currentStep > step.number ? 'linear-gradient(to right, #9333ea, #3b82f6)' : 'rgba(255, 255, 255, 0.2)',
                      zIndex: 0
                    }}
                  />
                )}
                
                {/* Step Circle */}
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1}}>
                  <div 
                    style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      background: currentStep >= step.number ? 'linear-gradient(to right, #9333ea, #3b82f6)' : 'rgba(255, 255, 255, 0.1)',
                      border: currentStep >= step.number ? 'none' : '2px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.125rem',
                      marginBottom: '0.5rem',
                      color: 'white'
                    }}
                  >
                    {step.number}
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <p style={{fontSize: '0.875rem', fontWeight: '600', color: currentStep >= step.number ? 'white' : '#cbd5e1', marginBottom: '0.25rem'}}>{step.title}</p>
                    <p style={{fontSize: '0.75rem', color: '#94a3b8'}}>{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Info Banner */}
        {selectedClient && (
          <div style={{backgroundColor: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(147, 51, 234, 0.3)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '2rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <Users style={{height: '1.25rem', width: '1.25rem', color: '#a78bfa'}} />
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Editing quote for:</p>
                <p style={{fontSize: '1.125rem', fontWeight: '600', color: 'white'}}>{selectedClient.name} - {selectedClient.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '2rem', marginBottom: '2rem'}}>
          
          {/* Step 1: Add Services */}
          {currentStep === 1 && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <div>
                  <h2 style={{fontSize: '1.5rem', fontWeight: 'bold'}}>Add Services</h2>
                  <p style={{color: '#cbd5e1'}}>Select services and set pricing for this quote</p>
                </div>
                <button
                  onClick={addQuoteItem}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(to right, #9333ea, #3b82f6)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  <Plus style={{height: '1rem', width: '1rem'}} />
                  Add Service
                </button>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {quoteItems.map((item) => (
                  <div key={item.id} style={{backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                      <div style={{flex: 1}}>
                        <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Service Name</label>
                        <input
                          type="text"
                          value={item.serviceName}
                          onChange={(e) => updateQuoteItem(item.id, 'serviceName', e.target.value)}
                          style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                          placeholder="Enter service name"
                        />
                      </div>
                      <button
                        onClick={() => removeQuoteItem(item.id)}
                        style={{color: '#f87171', cursor: 'pointer', border: 'none', background: 'none'}}
                      >
                        <Trash2 style={{height: '1rem', width: '1rem'}} />
                      </button>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '1rem'}}>
                      <div>
                        <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Pricing Type</label>
                        <select
                          value={item.pricingType || 'flat'}
                          onChange={(e) => updateQuoteItem(item.id, 'pricingType', e.target.value as 'hourly' | 'flat')}
                          style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                        >
                          <option value="flat">Flat Rate</option>
                          <option value="hourly">Per Hour</option>
                        </select>
                      </div>
                      <div>
                        <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>
                          {(item.pricingType || 'flat') === 'hourly' ? 'Hours' : 'Quantity'}
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuoteItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                        />
                      </div>
                      <div>
                        <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>
                          {(item.pricingType || 'flat') === 'hourly' ? 'Rate ($/hr)' : 'Rate ($)'}
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateQuoteItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                        />
                      </div>
                      <div>
                        <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Taxable</label>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem'}}>
                          <input
                            type="checkbox"
                            checked={item.taxable}
                            onChange={(e) => updateQuoteItem(item.id, 'taxable', e.target.checked)}
                            style={{width: '1rem', height: '1rem', accentColor: '#3b82f6'}}
                          />
                          <span style={{fontSize: '0.875rem', color: 'white'}}>Yes</span>
                        </div>
                      </div>
                      <div>
                        <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Amount</label>
                        <div style={{padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', fontWeight: '500'}}>
                          ${item.total.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {quoteItems.length === 0 && (
                  <div style={{textAlign: 'center', padding: '3rem', color: '#94a3b8'}}>
                    <p>No services added yet. Click "Add Service" to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Add Contractors */}
          {currentStep === 2 && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <div>
                  <h2 style={{fontSize: '1.5rem', fontWeight: 'bold'}}>Add Contractors</h2>
                  <p style={{color: '#cbd5e1'}}>Assign contractors and set payment terms</p>
                </div>
                <button
                  onClick={addContractor}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(to right, #9333ea, #3b82f6)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  <Plus style={{height: '1rem', width: '1rem'}} />
                  Add Contractor
                </button>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {quoteContractors.map((contractor) => (
                  <div key={contractor.id} style={{backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                      <div style={{flex: 1}}>
                        <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Select Contractor</label>
                        <select
                          value={contractor.contractorId}
                          onChange={(e) => selectContractor(contractor.id, e.target.value)}
                          style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                        >
                          <option value="">Choose a contractor...</option>
                          {contractors.map((c) => (
                            <option key={c.id} value={c.id}>{c.name} - {c.specialty}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => removeContractor(contractor.id)}
                        style={{color: '#f87171', cursor: 'pointer', border: 'none', background: 'none', marginLeft: '1rem'}}
                      >
                        <Trash2 style={{height: '1rem', width: '1rem'}} />
                      </button>
                    </div>
                    
                    {contractor.contractorId && (
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem'}}>
                        <div>
                          <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Payment Type</label>
                          <select
                            value={contractor.paymentType}
                            onChange={(e) => updateContractor(contractor.id, 'paymentType', e.target.value as 'hourly' | 'flat')}
                            style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                          >
                            <option value="hourly">Hourly</option>
                            <option value="flat">Flat Rate</option>
                          </select>
                        </div>
                        {contractor.paymentType === 'hourly' && (
                          <div>
                            <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Hours</label>
                            <input
                              type="number"
                              value={contractor.hours || 0}
                              onChange={(e) => updateContractor(contractor.id, 'hours', parseFloat(e.target.value) || 0)}
                              style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                            />
                          </div>
                        )}
                        <div>
                          <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Rate ($)</label>
                          <input
                            type="number"
                            value={contractor.rate}
                            onChange={(e) => updateContractor(contractor.id, 'rate', parseFloat(e.target.value) || 0)}
                            style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                          />
                        </div>
                        <div>
                          <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Amount</label>
                          <div style={{padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', fontWeight: '500'}}>
                            ${contractor.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {quoteContractors.length === 0 && (
                  <div style={{textAlign: 'center', padding: '3rem', color: '#94a3b8'}}>
                    <p>No contractors added yet. Click "Add Contractor" to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review & Send */}
          {currentStep === 3 && (
            <div>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>Review & Send Quote</h2>
              <p style={{color: '#cbd5e1', marginBottom: '2rem'}}>Review all details before sending to client</p>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
                {/* Left Column */}
                <div>
                  {/* Client Info */}
                  <div style={{backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem'}}>
                    <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '1rem'}}>Client Information</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                      <div>
                        <span style={{color: '#94a3b8', fontSize: '0.875rem'}}>Name: </span>
                        <span style={{color: 'white'}}>{selectedClient?.name}</span>
                      </div>
                      <div>
                        <span style={{color: '#94a3b8', fontSize: '0.875rem'}}>Email: </span>
                        <span style={{color: 'white'}}>{selectedClient?.email}</span>
                      </div>
                      {selectedClient?.phone && (
                        <div>
                          <span style={{color: '#94a3b8', fontSize: '0.875rem'}}>Phone: </span>
                          <span style={{color: 'white'}}>{selectedClient.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Services Breakdown */}
                  {quoteItems.length > 0 && (
                    <div style={{marginBottom: '1rem'}}>
                      <h4 style={{fontSize: '1rem', fontWeight: '500', color: 'white', marginBottom: '0.5rem'}}>Services</h4>
                      <div style={{backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', padding: '1rem'}}>
                        {quoteItems.map((item) => (
                          <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                              <span style={{color: '#cbd5e1'}}>{item.serviceName} (x{item.quantity})</span>
                              {!item.taxable && (
                                <span style={{fontSize: '0.75rem', color: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem'}}>
                                  Non-taxable
                                </span>
                              )}
                            </div>
                            <span style={{color: 'white'}}>${item.total.toLocaleString()}</span>
                          </div>
                        ))}
                        <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '0.5rem', fontWeight: '500'}}>
                          <span style={{color: '#cbd5e1'}}>Services Total:</span>
                          <span style={{color: 'white'}}>${servicesTotal.toLocaleString()}</span>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem', fontSize: '0.875rem'}}>
                          <span style={{color: '#94a3b8'}}>Taxable Amount:</span>
                          <span style={{color: '#cbd5e1'}}>${taxableAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contractors Breakdown */}
                  {quoteContractors.length > 0 && (
                    <div style={{marginBottom: '1rem'}}>
                      <h4 style={{fontSize: '1rem', fontWeight: '500', color: 'white', marginBottom: '0.5rem'}}>Contractors</h4>
                      <div style={{backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', padding: '1rem'}}>
                        {quoteContractors.map((contractor) => (
                          <div key={contractor.id} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                            <span style={{color: '#cbd5e1'}}>
                              {contractor.contractorName}
                              {contractor.paymentType === 'hourly' && ` (${contractor.hours}h)`}
                            </span>
                            <span style={{color: 'white'}}>${contractor.amount.toLocaleString()}</span>
                          </div>
                        ))}
                        <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '0.5rem', fontWeight: '500'}}>
                          <span style={{color: '#cbd5e1'}}>Contractors Total:</span>
                          <span style={{color: 'white'}}>${contractorsTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div>
                  {/* Additional Details */}
                  <div style={{backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem'}}>
                    <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '1rem'}}>Additional Details</h3>
                    
                    <div style={{marginBottom: '1rem'}}>
                      <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Project</label>
                      <input
                        type="text"
                        value={project}
                        onChange={(e) => setProject(e.target.value)}
                        style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                        placeholder="Enter project name..."
                      />
                    </div>

                    <div style={{marginBottom: '1rem'}}>
                      <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Project Description</label>
                      <textarea
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        rows={3}
                        style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', resize: 'vertical'}}
                        placeholder="Describe the project details..."
                      />
                    </div>

                    <div style={{marginBottom: '1rem'}}>
                      <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Valid Until</label>
                      <input
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                      />
                    </div>

                    <div>
                      <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Notes</label>
                      <textarea
                        value={quoteNotes}
                        onChange={(e) => setQuoteNotes(e.target.value)}
                        rows={3}
                        style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', resize: 'vertical'}}
                        placeholder="Add any additional notes..."
                      />
                    </div>
                  </div>

                  {/* Total */}
                  <div style={{backgroundColor: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(147, 51, 234, 0.3)', borderRadius: '0.5rem', padding: '1.5rem'}}>
                    <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '1rem'}}>Quote Total</h3>
                    <div style={{backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', padding: '1rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                        <span style={{color: '#cbd5e1'}}>Subtotal:</span>
                        <span style={{color: 'white'}}>${subtotal.toLocaleString()}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                        <span style={{color: '#cbd5e1'}}>Tax (8% on taxable items):</span>
                        <span style={{color: 'white'}}>${taxAmount.toLocaleString()}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '0.5rem', fontWeight: 'bold'}}>
                        <span style={{color: 'white'}}>Total:</span>
                        <span style={{color: 'white', fontSize: '1.125rem'}}>${totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div style={{display: 'flex', justifyContent: 'space-between', gap: '1rem'}}>
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: currentStep === 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: currentStep === 1 ? '#94a3b8' : 'white',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            <ChevronLeft style={{height: '1rem', width: '1rem'}} />
            Previous
          </button>

          <div style={{display: 'flex', gap: '1rem'}}>
            {currentStep === 3 ? (
              <>
                <button
                  onClick={() => handleUpdateQuote('draft')}
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
                  <Save style={{height: '1rem', width: '1rem'}} />
                  Save as Draft
                </button>
                <button
                  onClick={() => handleUpdateQuote('sent')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(to right, #10b981, #14b8a6)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  <Send style={{height: '1rem', width: '1rem'}} />
                  Update & Send Quote
                </button>
              </>
            ) : (
              <button
                onClick={nextStep}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(to right, #9333ea, #3b82f6)',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Next
                <ChevronRight style={{height: '1rem', width: '1rem'}} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
