'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Music, Home, Users, FileText, DollarSign, User, Settings } from 'lucide-react'
import Link from 'next/link'
import UserMenu from '@/components/user-menu'

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

interface ServiceItem {
  serviceName: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  taxable: boolean
  contractorId?: string
  contractor?: Contractor
}

interface InvoiceContractor {
  contractorId: string
  assignedSkills: string[]
  rateType: string
  hours: number | null
  cost: number
  includeInTotal: boolean
  contractor: Contractor
}

export default function NewInvoicePage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [clients, setClients] = useState<Client[]>([])
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [services, setServices] = useState<ServiceItem[]>([])
  const [assignedContractors, setAssignedContractors] = useState<InvoiceContractor[]>([])
  
  // Form data
  const [project, setProject] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')
  
  // Contractor assignment
  const [availableSkills, setAvailableSkills] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [filteredContractors, setFilteredContractors] = useState<Contractor[]>([])
  const [selectedContractor, setSelectedContractor] = useState('')
  const [contractorRateType, setContractorRateType] = useState<'hourly' | 'flat'>('hourly')
  const [contractorHours, setContractorHours] = useState(1)
  const [contractorCost, setContractorCost] = useState(0)
  
  // Service form
  const [serviceForm, setServiceForm] = useState({
    serviceName: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxable: false
  })
  
  // Modals
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [showAddContractorModal, setShowAddContractorModal] = useState(false)
  const [editingService, setEditingService] = useState<number | null>(null)
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchClients()
    fetchContractors()
    loadAvailableSkills()
  }, [])

  useEffect(() => {
    // Filter contractors based on selected skills
    if (selectedSkills.length === 0) {
      setFilteredContractors(contractors)
    } else {
      const filtered = contractors.filter(contractor =>
        selectedSkills.every(skill => contractor.skills.includes(skill))
      )
      setFilteredContractors(filtered)
    }
  }, [contractors, selectedSkills])

  useEffect(() => {
    // Calculate contractor cost
    if (selectedContractor && contractors.length > 0) {
      const contractor = contractors.find(c => c.id === selectedContractor)
      if (contractor) {
        if (contractorRateType === 'hourly') {
          setContractorCost(contractor.hourlyRate * contractorHours)
        } else {
          setContractorCost(contractor.flatRate || contractor.rate)
        }
      }
    }
  }, [selectedContractor, contractorRateType, contractorHours, contractors])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
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

  const loadAvailableSkills = () => {
    const skills = localStorage.getItem('availableSkills')
    if (skills) {
      try {
        setAvailableSkills(JSON.parse(skills))
      } catch (error) {
        console.error('Error parsing available skills:', error)
        setAvailableSkills([])
      }
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

  const addService = () => {
    if (!serviceForm.serviceName || serviceForm.unitPrice <= 0) {
      alert('Please fill in service name and unit price')
      return
    }

    const total = Number(serviceForm.quantity) * Number(serviceForm.unitPrice)
    const newService: ServiceItem = {
      ...serviceForm,
      total,
      contractorId: serviceForm.contractorId
    }

    if (editingService !== null) {
      setServices(prev => prev.map((service, index) => 
        index === editingService ? newService : service
      ))
      setEditingService(null)
    } else {
      setServices(prev => [...prev, newService])
    }

    setServiceForm({
      serviceName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxable: false
    })
    setShowAddServiceModal(false)
  }

  const editService = (index: number) => {
    const service = services[index]
    setServiceForm({
      serviceName: service.serviceName,
      description: service.description,
      quantity: service.quantity,
      unitPrice: service.unitPrice,
      taxable: service.taxable
    })
    setEditingService(index)
    setShowAddServiceModal(true)
  }

  const deleteService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index))
  }

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const assignContractor = () => {
    if (!selectedContractor || selectedSkills.length === 0) {
      alert('Please select skills and a contractor')
      return
    }
    
    const contractor = contractors.find(c => c.id === selectedContractor)
    if (!contractor) return

    const newAssignment: InvoiceContractor = {
      contractorId: selectedContractor,
      assignedSkills: [...selectedSkills],
      rateType: contractorRateType,
      hours: contractorRateType === 'hourly' ? contractorHours : null,
      cost: contractorCost,
      includeInTotal: true,
      contractor
    }

    setAssignedContractors(prev => [...prev, newAssignment])
    
    // Reset form
    setSelectedSkills([])
    setSelectedContractor('')
    setContractorHours(1)
    setContractorRateType('hourly')
    setShowAddContractorModal(false)
  }

  const removeContractor = (contractorId: string) => {
    setAssignedContractors(prev => prev.filter(c => c.contractorId !== contractorId))
  }

  const toggleIncludeInTotal = (contractorId: string) => {
    setAssignedContractors(prev => 
      prev.map(c => 
        c.contractorId === contractorId 
          ? { ...c, includeInTotal: !c.includeInTotal }
          : c
      )
    )
  }

  const calculateTotals = () => {
    const subtotal = services.reduce((sum, service) => sum + service.total, 0)
    const contractorCostsTotal = assignedContractors
      .filter(c => c.includeInTotal)
      .reduce((sum, c) => sum + Number(c.cost), 0)
    
    const taxableAmount = services
      .filter(service => service.taxable)
      .reduce((sum, service) => sum + service.total, 0)
    
    const taxRate = 8 // Default tax rate
    const taxAmount = (taxableAmount * taxRate) / 100
    const total = subtotal + contractorCostsTotal + taxAmount

    return { subtotal, contractorCostsTotal, taxableAmount, taxRate, taxAmount, total }
  }

  const handleSaveDraft = async () => {
    if (!selectedClient || !project) {
      alert('Please select a client and enter project name')
      return
    }

    setLoading(true)
    try {
      const totals = calculateTotals()
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          projectDescription,
          dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          subtotal: totals.subtotal,
          taxRate: totals.taxRate,
          taxAmount: totals.taxAmount,
          total: totals.total,
          notes,
          terms,
          clientId: selectedClient.id,
          clientName: getClientName(selectedClient),
          clientEmail: selectedClient.email,
          clientPhone: selectedClient.phone,
          clientAddress: selectedClient.address,
          items: services.map(service => ({
            serviceName: service.serviceName,
            description: service.description,
            quantity: service.quantity,
            unitPrice: service.unitPrice,
            total: service.total,
            taxable: service.taxable
          })),
          contractors: assignedContractors.map(ac => ({
            contractorId: ac.contractorId,
            assignedSkills: ac.assignedSkills,
            rateType: ac.rateType,
            hours: ac.hours,
            cost: ac.cost,
            includeInTotal: ac.includeInTotal
          }))
        })
      })

      if (response.ok) {
        const invoice = await response.json()
        alert('Invoice saved as draft!')
        router.push(`/invoices/${invoice.id}`)
      } else {
        const errorData = await response.json()
        alert(`Failed to save invoice: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
      alert('Error saving invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvoice = async () => {
    if (!selectedClient || !project) {
      alert('Please select a client and enter project name')
      return
    }

    setSending(true)
    try {
      const totals = calculateTotals()
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          projectDescription,
          status: 'sent',
          dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          subtotal: totals.subtotal,
          taxRate: totals.taxRate,
          taxAmount: totals.taxAmount,
          total: totals.total,
          notes,
          terms,
          clientId: selectedClient.id,
          clientName: getClientName(selectedClient),
          clientEmail: selectedClient.email,
          clientPhone: selectedClient.phone,
          clientAddress: selectedClient.address,
          items: services.map(service => ({
            serviceName: service.serviceName,
            description: service.description,
            quantity: service.quantity,
            unitPrice: service.unitPrice,
            total: service.total,
            taxable: service.taxable
          })),
          contractors: assignedContractors.map(ac => ({
            contractorId: ac.contractorId,
            assignedSkills: ac.assignedSkills,
            rateType: ac.rateType,
            hours: ac.hours,
            cost: ac.cost,
            includeInTotal: ac.includeInTotal
          }))
        })
      })

      if (response.ok) {
        const invoice = await response.json()
        alert('Invoice sent successfully!')
        router.push(`/invoices/${invoice.id}`)
      } else {
        const errorData = await response.json()
        alert(`Failed to send invoice: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error sending invoice:', error)
      alert('Error sending invoice')
    } finally {
      setSending(false)
    }
  }

  const totals = calculateTotals()

  if (!session) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{color: 'white', textAlign: 'center'}}>
          <h2>Please sign in to create invoices</h2>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Navigation */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
            <Link href="/invoices" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none'}}>
              <ArrowLeft style={{height: '1.25rem', width: '1.25rem'}} />
              Back to Invoices
            </Link>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <Link href="/" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', opacity: 0.7}}>
                <Home style={{height: '1.25rem', width: '1.25rem'}} />
                Dashboard
              </Link>
              <Link href="/clients" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', opacity: 0.7}}>
                <Users style={{height: '1.25rem', width: '1.25rem'}} />
                Clients
              </Link>
              <Link href="/quotes" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', opacity: 0.7}}>
                <FileText style={{height: '1.25rem', width: '1.25rem'}} />
                Quotes
              </Link>
              <Link href="/invoices" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', fontWeight: 'bold'}}>
                <DollarSign style={{height: '1.25rem', width: '1.25rem'}} />
                Invoices
              </Link>
              <Link href="/contractors" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', opacity: 0.7}}>
                <User style={{height: '1.25rem', width: '1.25rem'}} />
                Contractors
              </Link>
              <Link href="/settings" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', opacity: 0.7}}>
                <Settings style={{height: '1.25rem', width: '1.25rem'}} />
                Settings
              </Link>
            </div>
          </div>
          
          <UserMenu />
        </div>
      </div>

      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem'}}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          color: 'white'
        }}>
          <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem'}}>
            Create New Invoice
          </h1>

          {/* Step 1: Client Selection */}
          {step === 1 && (
            <div>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem'}}>
                Select Client
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {clients.map(client => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    style={{
                      padding: '1.5rem',
                      background: selectedClient?.id === client.id 
                        ? 'rgba(59, 130, 246, 0.2)' 
                        : 'rgba(255, 255, 255, 0.1)',
                      border: selectedClient?.id === client.id 
                        ? '2px solid #3b82f6' 
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                      {getClientName(client)}
                    </h3>
                    <p style={{color: '#cbd5e1', marginBottom: '0.25rem'}}>{client.email}</p>
                    {client.phone && <p style={{color: '#cbd5e1', marginBottom: '0.25rem'}}>{client.phone}</p>}
                    {client.address && <p style={{color: '#cbd5e1'}}>{client.address}</p>}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!selectedClient}
                style={{
                  padding: '1rem 2rem',
                  background: selectedClient ? 'linear-gradient(to right, #3b82f6, #1d4ed8)' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: 'white',
                  cursor: selectedClient ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                  fontSize: '1.125rem',
                  opacity: selectedClient ? 1 : 0.5
                }}
              >
                Continue to Services
              </button>
            </div>
          )}

          {/* Step 2: Services */}
          {step === 2 && (
            <div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h2 style={{fontSize: '1.5rem', fontWeight: 'bold'}}>Services</h2>
                <button
                  onClick={() => setShowAddServiceModal(true)}
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
                    fontWeight: 'bold'
                  }}
                >
                  <Plus style={{height: '1rem', width: '1rem'}} />
                  Add Service
                </button>
              </div>

              {services.length > 0 ? (
                <div style={{marginBottom: '2rem'}}>
                  {services.map((service, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{flex: 1}}>
                        <h4 style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>{service.serviceName}</h4>
                        {service.description && <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{service.description}</p>}
                        <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>
                          {service.quantity} × ${service.unitPrice.toFixed(2)} = ${service.total.toFixed(2)}
                          {service.taxable && <span style={{color: '#10b981', marginLeft: '0.5rem'}}>Taxable</span>}
                        </p>
                      </div>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                          onClick={() => editService(index)}
                          style={{
                            padding: '0.5rem',
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '0.25rem',
                            color: '#60a5fa',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit style={{height: '1rem', width: '1rem'}} />
                        </button>
                        <button
                          onClick={() => deleteService(index)}
                          style={{
                            padding: '0.5rem',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.25rem',
                            color: '#f87171',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 style={{height: '1rem', width: '1rem'}} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.75rem',
                  marginBottom: '2rem'
                }}>
                  <p style={{color: '#cbd5e1', fontSize: '1.125rem'}}>No services added yet</p>
                  <p style={{color: '#9ca3af', fontSize: '0.875rem'}}>Click "Add Service" to get started</p>
                </div>
              )}

              <div style={{display: 'flex', gap: '1rem'}}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    padding: '1rem 2rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  style={{
                    padding: '1rem 2rem',
                    background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Continue to Contractors
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contractors */}
          {step === 3 && (
            <div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h2 style={{fontSize: '1.5rem', fontWeight: 'bold'}}>Contractors</h2>
                <button
                  onClick={() => setShowAddContractorModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(to right, #8b5cf6, #7c3aed)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  <Plus style={{height: '1rem', width: '1rem'}} />
                  Add Contractor
                </button>
              </div>

              {assignedContractors.length > 0 ? (
                <div style={{marginBottom: '2rem'}}>
                  {assignedContractors.map((ac, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{flex: 1}}>
                        <h4 style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>{ac.contractor.name}</h4>
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.25rem'}}>
                          {ac.assignedSkills.map(skill => (
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
                          {ac.rateType === 'hourly' 
                            ? `${ac.hours} hrs @ $${ac.hours && ac.hours > 0 ? (ac.cost / ac.hours).toFixed(2) : '0.00'}/hr`
                            : 'Flat rate'
                          } = ${ac.cost.toFixed(2)}
                        </p>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                        <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                          <input
                            type="checkbox"
                            checked={ac.includeInTotal}
                            onChange={() => toggleIncludeInTotal(ac.contractorId)}
                            style={{margin: 0}}
                          />
                          <span style={{fontSize: '0.875rem'}}>Include in total</span>
                        </label>
                        <button
                          onClick={() => removeContractor(ac.contractorId)}
                          style={{
                            padding: '0.5rem',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.25rem',
                            color: '#f87171',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 style={{height: '1rem', width: '1rem'}} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.75rem',
                  marginBottom: '2rem'
                }}>
                  <p style={{color: '#cbd5e1', fontSize: '1.125rem'}}>No contractors assigned yet</p>
                  <p style={{color: '#9ca3af', fontSize: '0.875rem'}}>Click "Add Contractor" to get started</p>
                </div>
              )}

              <div style={{display: 'flex', gap: '1rem'}}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    padding: '1rem 2rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  style={{
                    padding: '1rem 2rem',
                    background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Continue to Details
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Additional Details */}
          {step === 4 && (
            <div>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem'}}>
                Additional Details
              </h2>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none'
                    }}
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
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

              <div style={{marginBottom: '1rem'}}>
                <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>
                  Project Description
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
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
                  placeholder="Enter project description"
                />
              </div>

              <div style={{marginBottom: '1rem'}}>
                <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  placeholder="Enter any additional notes"
                />
              </div>

              <div style={{marginBottom: '2rem'}}>
                <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>
                  Terms & Conditions
                </label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={4}
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
                  placeholder="Enter terms and conditions"
                />
              </div>

              <div style={{display: 'flex', gap: '1rem'}}>
                <button
                  onClick={() => setStep(3)}
                  style={{
                    padding: '1rem 2rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  style={{
                    padding: '1rem 2rem',
                    background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Review & Send
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Review & Send */}
          {step === 5 && (
            <div>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem'}}>
                Review and Send Invoice
              </h2>

              {/* Client Info */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>
                  Client Information
                </h3>
                <p style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>{getClientName(selectedClient!)}</p>
                <p style={{color: '#cbd5e1', marginBottom: '0.25rem'}}>{selectedClient!.email}</p>
                {selectedClient!.phone && <p style={{color: '#cbd5e1', marginBottom: '0.25rem'}}>{selectedClient!.phone}</p>}
                {selectedClient!.address && <p style={{color: '#cbd5e1'}}>{selectedClient!.address}</p>}
              </div>

              {/* Services */}
              {services.length > 0 && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>
                    Services
                  </h3>
                  {services.map((service, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <p style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>{service.serviceName}</p>
                        {service.description && <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{service.description}</p>}
                        <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>
                          {service.quantity} × ${service.unitPrice.toFixed(2)}
                          {service.taxable && <span style={{color: '#10b981', marginLeft: '0.5rem'}}>Taxable</span>}
                        </p>
                      </div>
                      <p style={{fontWeight: 'bold'}}>${service.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Contractors */}
              {assignedContractors.length > 0 && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>
                    Contractors
                  </h3>
                  {assignedContractors.map((ac, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <p style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>{ac.contractor.name}</p>
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.25rem'}}>
                          {ac.assignedSkills.map(skill => (
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
                          {ac.rateType === 'hourly' 
                            ? `${ac.hours} hrs @ $${ac.hours && ac.hours > 0 ? (ac.cost / ac.hours).toFixed(2) : '0.00'}/hr`
                            : 'Flat rate'
                          }
                          {!ac.includeInTotal && <span style={{color: '#f59e0b', marginLeft: '0.5rem'}}>(Not included in total)</span>}
                        </p>
                      </div>
                      <p style={{fontWeight: 'bold'}}>${ac.cost.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>
                  Invoice Summary
                </h3>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                  <span>Subtotal:</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.contractorCostsTotal > 0 && (
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                    <span>Contractors:</span>
                    <span>${totals.contractorCostsTotal.toFixed(2)}</span>
                  </div>
                )}
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                  <span>Tax ({totals.taxRate}% on taxable items):</span>
                  <span>${totals.taxAmount.toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                  paddingTop: '0.5rem'
                }}>
                  <span>Total:</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>

              <div style={{display: 'flex', gap: '1rem'}}>
                <button
                  onClick={() => setStep(4)}
                  style={{
                    padding: '1rem 2rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  style={{
                    padding: '1rem 2rem',
                    background: loading ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(to right, #6b7280, #4b5563)',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  onClick={handleSendInvoice}
                  disabled={sending}
                  style={{
                    padding: '1rem 2rem',
                    background: sending ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(to right, #10b981, #14b8a6)',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: 'white',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: sending ? 0.5 : 1
                  }}
                >
                  {sending ? 'Sending...' : 'Send Invoice'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '2rem',
            width: '500px',
            maxWidth: '90vw',
            color: 'white'
          }}>
            <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem'}}>
              {editingService !== null ? 'Edit Service' : 'Add Service'}
            </h3>
            
            <div style={{marginBottom: '1rem'}}>
              <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>
                Service Name *
              </label>
              <input
                type="text"
                value={serviceForm.serviceName}
                onChange={(e) => setServiceForm({...serviceForm, serviceName: e.target.value})}
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

            <div style={{marginBottom: '1rem'}}>
              <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>
                Description
              </label>
              <textarea
                value={serviceForm.description}
                onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
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

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
              <div>
                <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>
                  Quantity
                </label>
                <input
                  type="number"
                  value={serviceForm.quantity}
                  onChange={(e) => setServiceForm({...serviceForm, quantity: Number(e.target.value)})}
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
                <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>
                  Unit Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={serviceForm.unitPrice}
                  onChange={(e) => setServiceForm({...serviceForm, unitPrice: Number(e.target.value)})}
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

            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                <input
                  type="checkbox"
                  checked={serviceForm.taxable}
                  onChange={(e) => setServiceForm({...serviceForm, taxable: e.target.checked})}
                  style={{margin: 0}}
                />
                <span style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Taxable</span>
              </label>
            </div>

            <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
              <button
                onClick={() => {
                  setShowAddServiceModal(false)
                  setEditingService(null)
                  setServiceForm({
                    serviceName: '',
                    description: '',
                    quantity: 1,
                    unitPrice: 0,
                    taxable: false
                  })
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addService}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(to right, #10b981, #14b8a6)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {editingService !== null ? 'Update Service' : 'Add Service'}
              </button>
            </div>
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
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '2rem',
            width: '600px',
            maxWidth: '90vw',
            color: 'white'
          }}>
            <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem'}}>
              Assign Contractor
            </h3>
            
            {/* Skills Filter */}
            <div style={{marginBottom: '1.5rem'}}>
              <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem', display: 'block'}}>
                Select Skills (Required)
              </label>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem'}}>
                {availableSkills.map(skill => (
                  <label key={skill} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: selectedSkills.includes(skill) ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    border: selectedSkills.includes(skill) ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => toggleSkillFilter(skill)}
                      style={{margin: 0}}
                    />
                    <span style={{fontSize: '0.875rem'}}>{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contractor Selection */}
            {selectedSkills.length > 0 && (
              <div style={{marginBottom: '1.5rem'}}>
                <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem', display: 'block'}}>
                  Select Contractor
                </label>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto'}}>
                  {filteredContractors.map(contractor => (
                    <label key={contractor.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: selectedContractor === contractor.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: selectedContractor === contractor.id ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="contractor"
                        value={contractor.id}
                        checked={selectedContractor === contractor.id}
                        onChange={(e) => setSelectedContractor(e.target.value)}
                        style={{margin: 0}}
                      />
                      <div style={{flex: 1}}>
                        <p style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>{contractor.name}</p>
                        <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>
                          ${contractor.hourlyRate}/hr | ${contractor.flatRate || contractor.rate} flat
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Rate Type and Hours */}
            {selectedContractor && (
              <div style={{marginBottom: '1.5rem'}}>
                <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem', display: 'block'}}>
                  Rate Type
                </label>
                <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                    <input
                      type="radio"
                      name="rateType"
                      value="hourly"
                      checked={contractorRateType === 'hourly'}
                      onChange={(e) => setContractorRateType(e.target.value as 'hourly' | 'flat')}
                      style={{margin: 0}}
                    />
                    <span>Hourly</span>
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                    <input
                      type="radio"
                      name="rateType"
                      value="flat"
                      checked={contractorRateType === 'flat'}
                      onChange={(e) => setContractorRateType(e.target.value as 'hourly' | 'flat')}
                      style={{margin: 0}}
                    />
                    <span>Flat Rate</span>
                  </label>
                </div>

                {contractorRateType === 'hourly' && (
                  <div>
                    <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>
                      Hours
                    </label>
                    <input
                      type="number"
                      value={contractorHours}
                      onChange={(e) => setContractorHours(Number(e.target.value))}
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
                )}

                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginTop: '1rem',
                  textAlign: 'center'
                }}>
                  <p style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981'}}>
                    Cost: ${contractorCost.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
              <button
                onClick={() => {
                  setShowAddContractorModal(false)
                  setSelectedSkills([])
                  setSelectedContractor('')
                  setContractorHours(1)
                  setContractorRateType('hourly')
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={assignContractor}
                disabled={!selectedContractor || selectedSkills.length === 0}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: (!selectedContractor || selectedSkills.length === 0) 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'linear-gradient(to right, #8b5cf6, #7c3aed)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: (!selectedContractor || selectedSkills.length === 0) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: (!selectedContractor || selectedSkills.length === 0) ? 0.5 : 1
                }}
              >
                Assign Contractor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}