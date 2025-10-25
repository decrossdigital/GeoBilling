"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import UserMenu from "@/components/user-menu"
import { ArrowLeft, Save, Send, ChevronRight, ChevronLeft, Plus, Trash2, Music, Headphones, Mic, Home, FileText, Users, BarChart3, Settings, User } from "lucide-react"

interface Client {
  id: string
  firstName?: string
  lastName?: string
  email: string
  company: string
  phone?: string
  address?: string
}

// Helper function to get display name
const getClientName = (client: Client) => {
  if (client.firstName && client.lastName) {
    return `${client.firstName} ${client.lastName}`
  }
  return client.firstName || client.company || 'Unnamed Client'
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
  phone: string
  skills: string[]
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

export default function NewQuotePage() {
  const { data: session } = useSession()
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
  const [loading, setLoading] = useState(true)

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      if (!session) return
      
      try {
        const response = await fetch('/api/clients')
        if (response.ok) {
          const data = await response.json()
          setClients(data)
        } else {
          console.error('Failed to fetch clients')
        }
      } catch (error) {
        console.error('Error fetching clients:', error)
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
        } else {
          console.error('Failed to fetch contractors')
        }
      } catch (error) {
        console.error('Error fetching contractors:', error)
      }
    }

    fetchContractors()
  }, [session])

  // Fetch service templates from API
  useEffect(() => {
    const fetchServiceTemplates = async () => {
      if (!session) return
      
      try {
        const response = await fetch('/api/service-templates')
        if (response.ok) {
          const data = await response.json()
          setServiceTemplates(data)
        } else {
          console.error('Failed to fetch service templates')
        }
      } catch (error) {
        console.error('Error fetching service templates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchServiceTemplates()
  }, [session])

  const selectClient = (client: Client) => {
    setSelectedClient(client)
  }

  const addQuoteItem = (service?: ServiceTemplate) => {
    if (service) {
      const unitPrice = Number(service.rate) || 0
      const newItem: QuoteItem = {
        id: Date.now().toString(),
        serviceName: service.name,
        description: service.description || "",
        quantity: 1,
        unitPrice: unitPrice,
        total: unitPrice,
        taxable: false,
        pricingType: service.pricingType
      }
      setQuoteItems([...quoteItems, newItem])
    } else {
      const newItem: QuoteItem = {
        id: Date.now().toString(),
        serviceName: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
        taxable: false,
        pricingType: 'flat'
      }
      setQuoteItems([...quoteItems, newItem])
    }
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

  const addContractor = (contractor: Contractor) => {
    const newContractor: QuoteContractor = {
      id: Date.now().toString(),
      contractorId: contractor.id,
      contractorName: contractor.name,
      specialty: contractor.skills.join(', '),
      paymentType: contractor.pricingType as "hourly" | "flat",
      hours: 1,
      rate: Number(contractor.rate),
      amount: Number(contractor.rate)
    }
    setQuoteContractors([...quoteContractors, newContractor])
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

  const removeContractor = (id: string) => {
    setQuoteContractors(quoteContractors.filter(contractor => contractor.id !== id))
  }

  const handleSaveDraft = async () => {
    if (!selectedClient) {
      alert('Please select a client first')
      return
    }

    try {
      const servicesTotal = quoteItems.reduce((sum, item) => sum + Number(item.total), 0)
      const contractorsTotal = quoteContractors.reduce((sum, contractor) => sum + Number(contractor.amount), 0)
      const subtotal = Number(servicesTotal) + Number(contractorsTotal)
      const taxableAmount = quoteItems.reduce((sum, item) => sum + (item.taxable ? Number(item.total) : 0), 0)
      const taxRate = 8 // 8% tax
      const taxAmount = Number(taxableAmount) * (taxRate / 100)
      const total = Number(subtotal) + Number(taxAmount)

      // Set default validUntil date if not provided (30 days from now)
      const defaultValidUntil = validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      // Filter out pricingType from items as it's not in the database schema
      const itemsForDatabase = quoteItems.map(item => ({
        serviceName: item.serviceName,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        taxable: item.taxable
      }))
      
      const quoteData = {
        title: `Quote for ${getClientName(selectedClient)}`,
        description: "Professional music production services",
        project: project,
        projectDescription: projectDescription,
        status: "draft",
        validUntil: defaultValidUntil,
        subtotal: subtotal,
        taxRate: taxRate,
        taxAmount: taxAmount,
        total: total,
        notes: quoteNotes,
        terms: "Payment due within 30 days",
        clientId: selectedClient.id,
        clientName: getClientName(selectedClient),
        clientEmail: selectedClient.email,
        clientPhone: selectedClient.phone || "",
        clientAddress: selectedClient.address || "",
        items: itemsForDatabase,
        contractors: quoteContractors
      }

      console.log('Sending quote data:', quoteData)

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      })

      if (response.ok) {
        alert('Quote saved as draft successfully!')
        window.location.href = '/quotes'
      } else {
        const errorData = await response.json()
        console.error('Failed to save quote:', errorData)
        alert(`Failed to save quote: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving quote:', error)
      alert('Error saving quote')
    }
  }

  const handleSendQuote = async () => {
    if (!selectedClient) {
      alert('Please select a client first')
      return
    }

    try {
      const servicesTotal = quoteItems.reduce((sum, item) => sum + Number(item.total), 0)
      const contractorsTotal = quoteContractors.reduce((sum, contractor) => sum + Number(contractor.amount), 0)
      const subtotal = Number(servicesTotal) + Number(contractorsTotal)
      const taxableAmount = quoteItems.reduce((sum, item) => sum + (item.taxable ? Number(item.total) : 0), 0)
      const taxRate = 8 // 8% tax
      const taxAmount = Number(taxableAmount) * (taxRate / 100)
      const total = Number(subtotal) + Number(taxAmount)

      // Set default validUntil date if not provided (30 days from now)
      const defaultValidUntil = validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      // Filter out pricingType from items as it's not in the database schema
      const itemsForDatabase = quoteItems.map(item => ({
        serviceName: item.serviceName,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        taxable: item.taxable
      }))
      
      const quoteData = {
        title: `Quote for ${getClientName(selectedClient)}`,
        description: "Professional music production services",
        project: project,
        projectDescription: projectDescription,
        status: "sent",
        validUntil: defaultValidUntil,
        subtotal: subtotal,
        taxRate: taxRate,
        taxAmount: taxAmount,
        total: total,
        notes: quoteNotes,
        terms: "Payment due within 30 days",
        clientId: selectedClient.id,
        clientName: getClientName(selectedClient),
        clientEmail: selectedClient.email,
        clientPhone: selectedClient.phone || "",
        clientAddress: selectedClient.address || "",
        items: itemsForDatabase,
        contractors: quoteContractors
      }

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      })

      if (response.ok) {
        alert('Quote sent successfully!')
        window.location.href = '/quotes'
      } else {
        const errorData = await response.json()
        console.error('Failed to send quote:', errorData)
        alert(`Failed to send quote: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sending quote:', error)
      alert('Error sending quote')
    }
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const steps = [
    { number: 1, title: "Client Selection", description: "Choose the client for this quote" },
    { number: 2, title: "Add Services", description: "Select services and set pricing" },
    { number: 3, title: "Add Contractors", description: "Select contractors and payment terms" },
    { number: 4, title: "Review & Send", description: "Review quote details and send to client" }
  ]

  const servicesTotal = quoteItems.reduce((sum, item) => sum + Number(item.total), 0)
  const contractorsTotal = quoteContractors.reduce((sum, contractor) => sum + Number(contractor.amount), 0)
  const subtotal = Number(servicesTotal) + Number(contractorsTotal)
  const taxableAmount = quoteItems.reduce((sum, item) => sum + (item.taxable ? Number(item.total) : 0), 0)
  const taxAmount = Number(taxableAmount) * 0.08 // 8% tax on taxable items only
  const totalAmount = Number(subtotal) + Number(taxAmount)

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
                <BarChart3 style={{height: '1rem', width: '1rem'}} />
                <span>Invoices</span>
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
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <Link href="/quotes">
                <button style={{color: '#cbd5e1', cursor: 'pointer', border: 'none', background: 'none', padding: '0.5rem'}}>
                  <ArrowLeft style={{height: '1.25rem', width: '1.25rem'}} />
                </button>
              </Link>
              <div>
                <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white'}}>Create New Quote</h1>
                <p style={{color: '#cbd5e1'}}>Build a professional quote for your client</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div style={{marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            {steps.map((step, index) => (
              <div key={step.number} style={{display: 'flex', alignItems: 'center'}}>
                <div style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  borderRadius: '50%', 
                  border: '2px solid',
                  borderColor: currentStep >= step.number ? '#2563eb' : '#475569',
                  backgroundColor: currentStep >= step.number ? '#2563eb' : 'transparent',
                  color: currentStep >= step.number ? 'white' : '#94a3b8'
                }}>
                  {step.number}
                </div>
                <div style={{marginLeft: '0.75rem'}}>
                  <div style={{fontSize: '0.875rem', fontWeight: '500', color: 'white'}}>{step.title}</div>
                  <div style={{fontSize: '0.75rem', color: '#94a3b8'}}>{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div style={{
                    width: '4rem', 
                    height: '2px', 
                    margin: '0 1rem',
                    backgroundColor: currentStep > step.number ? '#2563eb' : '#475569'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
          {currentStep === 1 && (
            <div>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem'}}>Select Client</h2>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
                {clients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => selectClient(client)}
                    style={{
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: '2px solid',
                      borderColor: selectedClient?.id === client.id ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)',
                      backgroundColor: selectedClient?.id === client.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                      <div style={{padding: '0.5rem', backgroundColor: 'rgba(147, 51, 234, 0.2)', borderRadius: '0.5rem'}}>
                        <Users style={{height: '1.25rem', width: '1.25rem', color: '#a78bfa'}} />
                      </div>
                      <div>
                        <div style={{fontWeight: '500', color: 'white'}}>{getClientName(client)}</div>
                        <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{client.company}</div>
                        <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>{client.email}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem'}}>Add Services</h2>
              
              {/* Custom Service Option */}
              <div style={{marginBottom: '1.5rem'}}>
                <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '1rem'}}>Add Custom Service</h3>
                <div style={{padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.05)'}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                      <div style={{padding: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '0.5rem'}}>
                        <Plus style={{height: '1.25rem', width: '1.25rem', color: '#60a5fa'}} />
                      </div>
                      <div>
                        <div style={{fontWeight: '500', color: 'white'}}>Custom Service</div>
                        <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Add a one-time service not in your templates</div>
                      </div>
                    </div>
                    <button
                      onClick={() => addQuoteItem()}
                      style={{padding: '0.5rem', backgroundColor: '#2563eb', borderRadius: '0.5rem', border: 'none', cursor: 'pointer'}}
                    >
                      <Plus style={{height: '1rem', width: '1rem', color: 'white'}} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Service Templates */}
              <div style={{marginBottom: '1.5rem'}}>
                <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '1rem'}}>Available Services</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
                  {serviceTemplates.map((service) => {
                    // Convert icon name to component
                    let Icon = Music // default
                    if (service.icon) {
                      switch (service.icon) {
                        case 'Headphones':
                          Icon = Headphones
                          break
                        case 'Mic':
                          Icon = Mic
                          break
                        case 'Music':
                        default:
                          Icon = Music
                          break
                      }
                    }
                    return (
                      <div 
                        key={service.id} 
                        onClick={() => addQuoteItem(service)}
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
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                            <div style={{padding: '0.5rem', backgroundColor: 'rgba(147, 51, 234, 0.2)', borderRadius: '0.5rem'}}>
                              <Icon style={{height: '1.25rem', width: '1.25rem', color: '#a78bfa'}} />
                            </div>
                            <div>
                              <div style={{fontWeight: '500', color: 'white'}}>{service.name}</div>
                              <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{service.description}</div>
                              <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>${service.rate}{service.pricingType === 'hourly' ? '/hour' : ''}</div>
                            </div>
                          </div>
                          <div style={{padding: '0.5rem', backgroundColor: '#2563eb', borderRadius: '0.5rem', color: 'white', fontSize: '0.875rem', fontWeight: '500'}}>
                            Add
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quote Items */}
              {quoteItems.length > 0 && (
                <div>
                  <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '1rem'}}>Quote Items</h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {quoteItems.map((item) => (
                      <div key={item.id} style={{padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                                                  <div style={{flex: 1, marginRight: '1rem'}}>
                          <input
                            type="text"
                            placeholder="Enter service name"
                            value={item.serviceName}
                            onChange={(e) => updateQuoteItem(item.id, 'serviceName', e.target.value)}
                            style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', marginBottom: '0.5rem'}}
                          />
                          <textarea
                            placeholder="Enter service description"
                            value={item.description}
                            onChange={(e) => updateQuoteItem(item.id, 'description', e.target.value)}
                            rows={2}
                            style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', resize: 'vertical', fontFamily: 'inherit'}}
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
                  </div>
                </div>
              )}

              {/* Add Custom Service */}
              <div style={{marginTop: '1.5rem'}}>
                <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '1rem'}}>Custom Service</h3>
                <div 
                  onClick={() => addQuoteItem()}
                  style={{
                    padding: '1rem', 
                    border: '2px dashed rgba(255, 255, 255, 0.3)', 
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}>
                    <div style={{padding: '0.5rem', backgroundColor: 'rgba(147, 51, 234, 0.2)', borderRadius: '0.5rem'}}>
                      <Plus style={{height: '1.25rem', width: '1.25rem', color: '#a78bfa'}} />
                    </div>
                    <div>
                      <div style={{fontWeight: '500', color: 'white'}}>Add Custom Service</div>
                      <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Create a custom service with your own details</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem'}}>Add Contractors</h2>
              
              {/* Contractors */}
              <div style={{marginBottom: '1.5rem'}}>
                <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '1rem'}}>Available Contractors</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
                  {contractors.map((contractor) => (
                    <div
                      key={contractor.id}
                      onClick={() => addContractor(contractor)}
                      style={{
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: '2px solid',
                        borderColor: quoteContractors.some(qc => qc.contractorId === contractor.id) ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)',
                        backgroundColor: quoteContractors.some(qc => qc.contractorId === contractor.id) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                        <div style={{padding: '0.5rem', backgroundColor: 'rgba(147, 51, 234, 0.2)', borderRadius: '0.5rem'}}>
                          <User style={{height: '1.25rem', width: '1.25rem', color: '#a78bfa'}} />
                        </div>
                        <div>
                                                <div style={{fontWeight: '500', color: 'white'}}>{contractor.name}</div>
                      <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{contractor.skills.join(', ')}</div>
                      <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>${contractor.rate}{contractor.pricingType === 'hourly' ? '/hr' : ''}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quote Contractors */}
              {quoteContractors.length > 0 && (
                <div>
                  <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '1rem'}}>Quote Contractors</h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {quoteContractors.map((contractor) => (
                      <div key={contractor.id} style={{padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                          <div>
                            <div style={{fontWeight: '500', color: 'white'}}>{contractor.contractorName}</div>
                            <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{contractor.specialty}</div>
                          </div>
                          <button
                            onClick={() => removeContractor(contractor.id)}
                            style={{color: '#f87171', cursor: 'pointer', border: 'none', background: 'none'}}
                          >
                            <Trash2 style={{height: '1rem', width: '1rem'}} />
                          </button>
                        </div>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem'}}>
                          <div>
                            <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Payment Type</label>
                            <select
                              value={contractor.paymentType}
                              onChange={(e) => updateContractor(contractor.id, 'paymentType', e.target.value as "hourly" | "flat")}
                              style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                            >
                              <option value="hourly">Hourly Rate</option>
                              <option value="flat">Flat Rate</option>
                            </select>
                          </div>
                          {contractor.paymentType === 'hourly' && (
                            <div>
                              <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Hours</label>
                              <input
                                type="number"
                                value={contractor.hours || ''}
                                onChange={(e) => updateContractor(contractor.id, 'hours', parseInt(e.target.value) || 1)}
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
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem'}}>Review & Send</h2>
              
              {/* Quote Summary */}
              <div style={{marginBottom: '2rem'}}>
                <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '1rem'}}>Quote Summary</h3>
                
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
                            {contractor.contractorName} - {contractor.specialty}
                            {contractor.paymentType === 'hourly' && contractor.hours && ` (${contractor.hours}h @ $${contractor.rate}/hr)`}
                            {contractor.paymentType === 'flat' && ` (Flat rate)`}
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

                {/* Final Summary */}
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

              {/* Additional Details */}
              <div style={{marginBottom: '2rem'}}>
                <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '1rem'}}>Additional Details</h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div>
                    <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Project</label>
                    <input
                      type="text"
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                      placeholder="Enter project name..."
                    />
                  </div>
                  <div>
                    <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Valid Until</label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                    />
                  </div>
                </div>
                <div style={{marginTop: '1rem'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Project Description</label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={3}
                    style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', resize: 'vertical'}}
                    placeholder="Describe the project details..."
                  />
                </div>
                <div style={{marginTop: '1rem'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Notes</label>
                  <textarea
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    rows={4}
                    style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', resize: 'vertical'}}
                    placeholder="Add any additional notes for the client..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '2rem'}}>
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: currentStep === 1 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                color: currentStep === 1 ? '#94a3b8' : 'white',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <ChevronLeft style={{height: '1rem', width: '1rem'}} />
              Previous
            </button>
            
            <div style={{display: 'flex', gap: '1rem'}}>
              {currentStep < 4 && (
                <button
                  onClick={nextStep}
                  disabled={currentStep === 1 && !selectedClient}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: currentStep === 1 && !selectedClient ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(to right, #2563eb, #4f46e5)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: currentStep === 1 && !selectedClient ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  Next
                  <ChevronRight style={{height: '1rem', width: '1rem'}} />
                </button>
              )}
              
              {currentStep === 4 && (
                <>
                  <button
                    onClick={handleSaveDraft}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Save style={{height: '1rem', width: '1rem'}} />
                    Save Draft
                  </button>
                  <button
                    onClick={handleSendQuote}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(to right, #059669, #0d9488)',
                      color: 'white',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Send style={{height: '1rem', width: '1rem'}} />
                    Send Quote
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
