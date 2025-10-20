"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import UserMenu from "@/components/user-menu"
import { ArrowLeft, Save, Send, ChevronRight, ChevronLeft, Plus, Trash2, Music, Headphones, Mic, Home, FileText, Users, BarChart3, Settings, User, DollarSign, ArrowRight } from "lucide-react"

interface InvoiceItem {
  id: string
  serviceName: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Client {
  id: string
  name: string
  email: string
  company: string
  phone?: string
  address?: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  title: string
  description: string
  status: string
  issueDate: string
  dueDate: string
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes: string
  terms: string
  paymentMethod: string
  paymentReference: string
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  quoteId: string
  items: InvoiceItem[]
}

export default function EditInvoicePage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [invoiceData, setInvoiceData] = useState<Invoice | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [dueDate, setDueDate] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("net30")
  const [notes, setNotes] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")

  // Fetch invoice data
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!session || !params.id) return
      
      try {
        const response = await fetch(`/api/invoices/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setInvoiceData(data)
          setSelectedClient({
            id: data.clientId,
            name: data.clientName,
            email: data.clientEmail,
            company: data.clientName
          })
          setInvoiceItems(data.items || [])
          setDueDate(data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : "")
          setNotes(data.notes || "")
          setInvoiceNumber(data.invoiceNumber || "")
        } else {
          console.error('Failed to fetch invoice')
        }
      } catch (error) {
        console.error('Error fetching invoice:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [session, params.id])

  // Fetch clients
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

  const selectClient = (client: Client) => {
    setSelectedClient(client)
  }

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      serviceName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    setInvoiceItems([...invoiceItems, newItem])
  }

  const removeInvoiceItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id))
  }

  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        // Recalculate total
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice
        }
        return updatedItem
      }
      return item
    }))
  }

  const handleSaveInvoice = async () => {
    if (!invoiceData || !selectedClient) return

    setSaving(true)
    try {
      const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0)
      const taxAmount = subtotal * (invoiceData.taxRate / 100)
      const total = subtotal + taxAmount

      const updatedInvoice = {
        ...invoiceData,
        title: invoiceData.title,
        description: invoiceData.description,
        status: "draft",
        dueDate: dueDate,
        subtotal: subtotal,
        taxAmount: taxAmount,
        total: total,
        notes: notes,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientEmail: selectedClient.email,
        clientPhone: selectedClient.phone || "",
        clientAddress: selectedClient.address || "",
        items: invoiceItems
      }

      const response = await fetch(`/api/invoices/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInvoice),
      })

      if (response.ok) {
        alert('Invoice saved successfully!')
        router.push('/invoices')
      } else {
        console.error('Failed to save invoice')
        alert('Failed to save invoice')
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
      alert('Error saving invoice')
    } finally {
      setSaving(false)
    }
  }

  const handleSendInvoice = async () => {
    if (!invoiceData || !selectedClient) return

    setSaving(true)
    try {
      const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0)
      const taxAmount = subtotal * (invoiceData.taxRate / 100)
      const total = subtotal + taxAmount

      const updatedInvoice = {
        ...invoiceData,
        title: invoiceData.title,
        description: invoiceData.description,
        status: "sent",
        dueDate: dueDate,
        subtotal: subtotal,
        taxAmount: taxAmount,
        total: total,
        notes: notes,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientEmail: selectedClient.email,
        clientPhone: selectedClient.phone || "",
        clientAddress: selectedClient.address || "",
        items: invoiceItems
      }

      const response = await fetch(`/api/invoices/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInvoice),
      })

      if (response.ok) {
        alert('Invoice sent successfully!')
        router.push('/invoices')
      } else {
        console.error('Failed to send invoice')
        alert('Failed to send invoice')
      }
    } catch (error) {
      console.error('Error sending invoice:', error)
      alert('Error sending invoice')
    } finally {
      setSaving(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const steps = [
    { number: 1, title: "Client Selection" },
    { number: 2, title: "Add Services" },
    { number: 3, title: "Review & Send" }
  ]

  if (loading) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem'}}>
          <div style={{textAlign: 'center', padding: '4rem'}}>Loading invoice...</div>
        </div>
      </div>
    )
  }

  if (!invoiceData) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem'}}>
          <div style={{textAlign: 'center', padding: '4rem'}}>Invoice not found</div>
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
              <Link href="/invoices">
                <button style={{color: '#cbd5e1', cursor: 'pointer', border: 'none', background: 'none', padding: '0.5rem'}}>
                  <ArrowLeft style={{height: '1.25rem', width: '1.25rem'}} />
                </button>
              </Link>
              <div>
                <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white'}}>Edit Invoice</h1>
                <p style={{color: '#cbd5e1'}}>Update invoice details and services</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div style={{marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            {[1, 2, 3, 4].map((step) => (
              <div key={step} style={{display: 'flex', alignItems: 'center', flex: 1}}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  backgroundColor: currentStep >= step ? 'linear-gradient(to right, #2563eb, #4f46e5)' : 'rgba(255, 255, 255, 0.1)',
                  color: currentStep >= step ? 'white' : '#cbd5e1',
                  fontWeight: '500',
                  marginRight: '0.5rem'
                }}>
                  {step}
                </div>
                <div style={{flex: 1, height: '2px', backgroundColor: currentStep > step ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)'}} />
              </div>
            ))}
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem'}}>
            <span style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Client</span>
            <span style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Services</span>
            <span style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Review</span>
            <span style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Send</span>
          </div>
        </div>

        {/* Step Content */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '2rem'}}>
          {currentStep === 1 && (
            <div>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem'}}>Select Client</h2>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
                {clients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => selectClient(client)}
                    style={{
                      padding: '1.5rem',
                      borderRadius: '0.5rem',
                      border: '2px solid',
                      borderColor: selectedClient?.id === client.id ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)',
                      backgroundColor: selectedClient?.id === client.id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{fontWeight: '500', color: 'white', marginBottom: '0.5rem'}}>{client.name}</div>
                    <div style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>{client.company}</div>
                    <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>{client.email}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white'}}>Invoice Items</h2>
                <button
                  onClick={addInvoiceItem}
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
                    fontSize: '0.875rem'
                  }}
                >
                  <Plus style={{height: '0.875rem', width: '0.875rem'}} />
                  Add Item
                </button>
              </div>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {invoiceItems.map((item) => (
                  <div key={item.id} style={{padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                      <div style={{flex: 1, marginRight: '1rem'}}>
                        <input
                          type="text"
                          placeholder="Service name"
                          value={item.serviceName}
                          onChange={(e) => updateInvoiceItem(item.id, 'serviceName', e.target.value)}
                          style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', marginBottom: '0.5rem'}}
                        />
                        <textarea
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                          rows={2}
                          style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', resize: 'vertical'}}
                        />
                      </div>
                      <button
                        onClick={() => removeInvoiceItem(item.id)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '0.25rem',
                          color: '#f87171',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 style={{height: '1rem', width: '1rem'}} />
                      </button>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem'}}>
                      <div>
                        <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                        />
                      </div>
                      <div>
                        <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Rate ($)</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateInvoiceItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                        />
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

          {currentStep === 3 && (
            <div>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem'}}>Review & Send</h2>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
                <div>
                  <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '1rem'}}>Invoice Details</h3>
                  <div style={{backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', padding: '1rem'}}>
                    <div style={{marginBottom: '1rem'}}>
                      <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Invoice Number</label>
                      <input
                        type="text"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                      />
                    </div>
                    <div style={{marginBottom: '1rem'}}>
                      <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Due Date</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                      />
                    </div>
                    <div style={{marginBottom: '1rem'}}>
                      <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Payment Terms</label>
                      <select
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                        style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                      >
                        <option value="net15">Net 15</option>
                        <option value="net30">Net 30</option>
                        <option value="net45">Net 45</option>
                        <option value="net60">Net 60</option>
                      </select>
                    </div>
                    <div>
                      <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', resize: 'vertical'}}
                        placeholder="Add any additional notes for the client..."
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '1rem'}}>Invoice Summary</h3>
                  <div style={{backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', padding: '1rem'}}>
                    <div style={{marginBottom: '1rem'}}>
                      <div style={{fontWeight: '500', color: 'white', marginBottom: '0.5rem'}}>Client</div>
                      <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{selectedClient?.name}</div>
                      <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>{selectedClient?.company}</div>
                    </div>
                    
                    <div style={{marginBottom: '1rem'}}>
                      <div style={{fontWeight: '500', color: 'white', marginBottom: '0.5rem'}}>Services</div>
                      {invoiceItems.map((item) => (
                        <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem'}}>
                          <span style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{item.serviceName}</span>
                          <span style={{fontSize: '0.875rem', color: 'white'}}>${item.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '1rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                        <span style={{color: '#cbd5e1'}}>Subtotal:</span>
                        <span style={{color: 'white'}}>${invoiceData.subtotal.toLocaleString()}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                        <span style={{color: '#cbd5e1'}}>Tax (8%):</span>
                        <span style={{color: 'white'}}>${invoiceData.taxAmount.toLocaleString()}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '0.5rem'}}>
                        <span style={{color: 'white'}}>Total:</span>
                        <span style={{color: 'white', fontSize: '1.125rem'}}>${invoiceData.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem'}}>Final Review</h2>
              <div style={{textAlign: 'center', padding: '2rem'}}>
                <div style={{marginBottom: '2rem'}}>
                  <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>${invoiceData.total.toLocaleString()}</div>
                  <div style={{fontSize: '1rem', color: '#cbd5e1'}}>Total Invoice Amount</div>
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto'}}>
                  <button
                    onClick={handleSaveInvoice}
                    disabled={saving}
                    style={{
                      padding: '1rem 2rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: '500'
                    }}
                  >
                    <Save style={{height: '1rem', width: '1rem'}} />
                    {saving ? 'Saving...' : 'Save Invoice'}
                  </button>
                  
                  <button
                    onClick={handleSendInvoice}
                    disabled={saving}
                    style={{
                      padding: '1rem 2rem',
                      background: 'linear-gradient(to right, #059669, #0d9488)',
                      color: 'white',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: '500'
                    }}
                  >
                    <Send style={{height: '1rem', width: '1rem'}} />
                    {saving ? 'Sending...' : 'Send Invoice'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '2rem'}}>
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: currentStep === 1 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: currentStep === 1 ? '#94a3b8' : 'white',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: currentStep === 1 ? 0.5 : 1
            }}
          >
            <ArrowLeft style={{height: '1rem', width: '1rem'}} />
            Previous
          </button>
          
          <button
            onClick={nextStep}
            disabled={currentStep === 4}
            style={{
              padding: '0.75rem 1.5rem',
              background: currentStep === 4 ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(to right, #2563eb, #4f46e5)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: currentStep === 4 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: currentStep === 4 ? 0.5 : 1
            }}
          >
            Next
            <ArrowRight style={{height: '1rem', width: '1rem'}} />
          </button>
        </div>
      </div>
    </div>
  )
}
