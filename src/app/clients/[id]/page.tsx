"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import UserMenu from "@/components/user-menu"
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Music, 
  Home, 
  User, 
  BarChart3, 
  Settings,
  Plus,
  Calendar,
  MapPin,
  Building,
  Clock,
  Star,
  ExternalLink,
  MessageSquare,
  Save,
  X
} from "lucide-react"

interface Client {
  id: string
  firstName?: string
  lastName?: string
  company: string
  email: string
  phone: string
  address?: string
  website?: string
  notes?: string
  status: string
  createdAt: string
  updatedAt: string
}

// Helper function to get display name
const getClientName = (client: Client) => {
  if (client.firstName && client.lastName) {
    return `${client.firstName} ${client.lastName}`
  }
  return client.firstName || client.company || 'Unnamed Client'
}

interface ClientStats {
  totalQuotes: number
  totalInvoices: number
  totalRevenue: number
  averageQuoteValue: number
  averageInvoiceValue: number
  lastActivity: string
  conversionRate: number
}

interface JobHistory {
  id: string
  type: 'quote' | 'invoice'
  title: string
  amount: number
  status: string
  date: string
  reference: string
}

interface Note {
  id: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function ClientDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [editing, setEditing] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [emailForm, setEmailForm] = useState({
    subject: "",
    message: ""
  })
  const [sendingEmail, setSendingEmail] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    notes: "",
    status: ""
  })

  useEffect(() => {
    const fetchClientData = async () => {
      if (!session || !clientId) return

      try {
        setLoading(true)
        
        // Fetch client details
        const clientResponse = await fetch(`/api/clients/${clientId}`)
        if (clientResponse.ok) {
          const clientData = await clientResponse.json()
          setClient(clientData)
          setEditForm({
            firstName: clientData.firstName || "",
            lastName: clientData.lastName || "",
            company: clientData.company || "",
            email: clientData.email,
            phone: clientData.phone || "",
            address: clientData.address || "",
            website: clientData.website || "",
            notes: clientData.notes || "",
            status: clientData.status
          })
        }

        // Fetch client statistics
        const statsResponse = await fetch(`/api/clients/${clientId}/stats`)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        // Fetch job history
        const historyResponse = await fetch(`/api/clients/${clientId}/history`)
        if (historyResponse.ok) {
          const historyData = await historyResponse.json()
          setJobHistory(historyData)
        }

        // Fetch notes
        const notesResponse = await fetch(`/api/clients/${clientId}/notes`)
        if (notesResponse.ok) {
          const notesData = await notesResponse.json()
          setNotes(notesData)
        }

      } catch (error) {
        console.error('Error fetching client data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [session, clientId])

  const handleSaveEdit = async () => {
    if (!client) return

    // Basic validation
    if (!editForm.email.trim()) {
      alert('Email is required')
      return
    }

    if (!editForm.firstName.trim() && !editForm.company.trim()) {
      alert('Either first name or company is required')
      return
    }

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const updatedClient = await response.json()
        setClient(updatedClient)
        setEditing(false)
        alert('Client updated successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to update client: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating client:', error)
      alert('Failed to update client. Please try again.')
    }
  }

  const handleDeleteClient = async () => {
    if (!client) return

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/clients')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      const response = await fetch(`/api/clients/${clientId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newNote }),
      })

      if (response.ok) {
        const note = await response.json()
        setNotes([note])
        setNewNote("")
      } else {
        console.error('Failed to add note')
      }
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }

  const handleSendEmail = async () => {
    if (!emailForm.subject.trim() || !emailForm.message.trim() || !client) return

    setSendingEmail(true)
    try {
      const response = await fetch('/api/clients/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: client.id,
          to: 'george@uniquitousmusic.com', // Sandbox mode - send to verified email
          subject: emailForm.subject,
          message: emailForm.message,
        }),
      })

      if (response.ok) {
        alert('Email sent successfully!')
        setShowEmailModal(false)
        setEmailForm({ subject: "", message: "" })
      } else {
        const error = await response.json()
        alert(`Failed to send email: ${error.error}`)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/notes`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ noteId }),
      })

      if (response.ok) {
        setNotes([])
      } else {
        console.error('Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return { bg: 'rgba(34, 197, 94, 0.2)', color: '#34d399' }
      case 'pending':
        return { bg: 'rgba(251, 146, 60, 0.2)', color: '#fb923c' }
      case 'overdue':
        return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }
      case 'draft':
        return { bg: 'rgba(107, 114, 128, 0.2)', color: '#6b7280' }
      default:
        return { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }
    }
  }

  const handleCreateQuote = () => {
    router.push(`/quotes/new?clientId=${clientId}`)
  }

  const handleCreateInvoice = () => {
    router.push(`/invoices/new?clientId=${clientId}`)
  }

  if (loading) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '1.5rem', marginBottom: '1rem'}}>Loading client...</div>
          <div style={{width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto'}}></div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!client) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '1.5rem', marginBottom: '1rem'}}>Client not found</div>
          <Link href="/clients" style={{color: '#60a5fa', textDecoration: 'none'}}>Back to Clients</Link>
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
              <Link href="/clients" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'linear-gradient(to right, #9333ea, #3b82f6)', color: 'white', textDecoration: 'none', fontWeight: '500', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}>
                <Users style={{height: '1rem', width: '1rem'}} />
                <span>Clients</span>
              </Link>
              <Link href="/quotes" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
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
              <Link href="/analytics" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <BarChart3 style={{height: '1rem', width: '1rem'}} />
                <span>Analytics</span>
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

        {/* Back Button */}
        <div style={{marginBottom: '2rem'}}>
          <Link href="/clients" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', textDecoration: 'none', fontSize: '0.875rem'}}>
            <ArrowLeft style={{height: '1rem', width: '1rem'}} />
            Back to Clients
          </Link>
        </div>

        {/* Client Header with Contact Information */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '2rem', marginBottom: '2rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div style={{flex: 1}}>
              <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
                {editing ? (
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '0.5rem',
                        padding: '0.5rem',
                        color: 'white',
                        fontSize: '2.25rem',
                        fontWeight: 'bold',
                        width: '200px'
                      }}
                      placeholder="First name"
                    />
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '0.5rem',
                        padding: '0.5rem',
                        color: 'white',
                        fontSize: '2.25rem',
                        fontWeight: 'bold',
                        width: '200px'
                      }}
                      placeholder="Last name"
                    />
                  </div>
                ) : (
                  getClientName(client)
                )}
              </h1>
              <p style={{color: '#cbd5e1', fontSize: '1.125rem', marginBottom: '1rem'}}>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) => setEditForm({...editForm, company: e.target.value})}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      color: '#cbd5e1',
                      fontSize: '1.125rem',
                      width: '250px'
                    }}
                    placeholder="Enter company name"
                  />
                ) : (
                  client.company
                )}
              </p>
              
              {/* Contact Information Grid */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <Mail style={{height: '1rem', width: '1rem', color: '#cbd5e1'}} />
                  <span style={{color: 'white'}}>
                    {editing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '0.25rem',
                          padding: '0.25rem',
                          color: 'white',
                          width: '200px'
                        }}
                        placeholder="Enter email address"
                      />
                    ) : (
                      client.email
                    )}
                  </span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <Phone style={{height: '1rem', width: '1rem', color: '#cbd5e1'}} />
                  <span style={{color: 'white'}}>
                    {editing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '0.25rem',
                          padding: '0.25rem',
                          color: 'white',
                          width: '150px'
                        }}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      client.phone || <span style={{color: '#94a3b8', fontStyle: 'italic'}}>No phone provided</span>
                    )}
                  </span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <MapPin style={{height: '1rem', width: '1rem', color: '#cbd5e1'}} />
                  <span style={{color: 'white'}}>
                    {editing ? (
                      <textarea
                        value={editForm.address}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '0.25rem',
                          padding: '0.25rem',
                          color: 'white',
                          width: '250px',
                          minHeight: '60px',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          fontSize: '0.875rem'
                        }}
                        placeholder="Enter address"
                      />
                    ) : (
                      client.address || <span style={{color: '#94a3b8', fontStyle: 'italic'}}>No address provided</span>
                    )}
                  </span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <Calendar style={{height: '1rem', width: '1rem', color: '#cbd5e1'}} />
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Client since {formatDate(client.createdAt)}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '50%',
                    backgroundColor: (editing ? editForm.status : client.status) === 'active' ? '#34d399' : '#ef4444'
                  }} />
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>
                    Status: <span style={{color: 'white', fontWeight: '500', textTransform: 'capitalize'}}>{editing ? editForm.status : client.status}</span>
                  </span>
                  {editing && (
                    <button
                      onClick={() => {
                        const newStatus = editForm.status === 'active' ? 'inactive' : 'active'
                        setEditForm({...editForm, status: newStatus})
                      }}
                      style={{
                        marginLeft: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: editForm.status === 'active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(52, 211, 153, 0.1)',
                        border: editForm.status === 'active' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(52, 211, 153, 0.3)',
                        borderRadius: '0.25rem',
                        color: editForm.status === 'active' ? '#ef4444' : '#34d399',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      Toggle to {editForm.status === 'active' ? 'Inactive' : 'Active'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', height: '100%', justifyContent: 'space-between'}}>
              {editing ? (
                <>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button
                      onClick={handleSaveEdit}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#10b981',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      <Save style={{height: '1rem', width: '1rem'}} />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false)
                        // Reset form to original values
                        setEditForm({
                          firstName: client.firstName || "",
                          lastName: client.lastName || "",
                          company: client.company || "",
                          email: client.email,
                          phone: client.phone || "",
                          address: client.address || "",
                          website: client.website || "",
                          notes: client.notes || "",
                          status: client.status
                        })
                      }}
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
                      Cancel
                    </button>
                  </div>
                  <div style={{flex: 1}}></div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    <Trash2 style={{height: '1rem', width: '1rem'}} />
                    Delete Client
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
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
                  <Edit style={{height: '1rem', width: '1rem'}} />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap'}}>
          <button
            onClick={handleCreateQuote}
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
            <Plus style={{height: '1rem', width: '1rem'}} />
            Create Quote
          </button>
          <button
            onClick={handleCreateInvoice}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'linear-gradient(to right, #10b981, #14b8a6)',
              background: 'linear-gradient(to right, #10b981, #14b8a6)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <Plus style={{height: '1rem', width: '1rem'}} />
            Create Invoice
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
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
            <Mail style={{height: '1rem', width: '1rem'}} />
            Email
          </button>
          <a
            href={`tel:${client.phone}`}
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
              fontWeight: '500',
              textDecoration: 'none'
            }}
          >
            <Phone style={{height: '1rem', width: '1rem'}} />
            Call
          </a>

        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem'}}>
          {/* Left Column - Notes & Stats */}
          <div>

            {/* Notes Section */}
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem'}}>
              <h2 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Notes & Comments</h2>
              
              {/* Add Note */}
              <div style={{marginBottom: '1.5rem'}}>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this client..."
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: newNote.trim() ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '0.25rem',
                    color: 'white',
                    cursor: newNote.trim() ? 'pointer' : 'not-allowed',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}
                >
                  Add Note
                </button>
              </div>

              {/* Notes List */}
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <div key={note.id} style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      position: 'relative'
                    }}>
                      <p style={{color: 'white', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '0.5rem'}}>{note.content}</p>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span style={{color: '#cbd5e1', fontSize: '0.75rem'}}>{formatDateTime(note.createdAt)}</span>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.25rem',
                            color: '#ef4444',
                            cursor: 'pointer'
                          }}
                          title="Delete note"
                        >
                          <X style={{height: '0.75rem', width: '0.75rem'}} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{textAlign: 'center', padding: '2rem', color: '#cbd5e1'}}>
                    <MessageSquare style={{height: '2rem', width: '2rem', margin: '0 auto 1rem', opacity: 0.5}} />
                    <p>No notes yet</p>
                    <p style={{fontSize: '0.75rem', marginTop: '0.5rem'}}>Add your first note above</p>
                  </div>
                )}
              </div>
            </div>

            {/* Client Statistics */}
            {stats && (
              <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
                <h2 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Statistics</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{color: '#cbd5e1'}}>Total Revenue</span>
                    <span style={{color: 'white', fontWeight: 'bold'}}>{formatCurrency(stats.totalRevenue)}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{color: '#cbd5e1'}}>Total Quotes</span>
                    <span style={{color: 'white', fontWeight: 'bold'}}>{stats.totalQuotes}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{color: '#cbd5e1'}}>Total Invoices</span>
                    <span style={{color: 'white', fontWeight: 'bold'}}>{stats.totalInvoices}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{color: '#cbd5e1'}}>Conversion Rate</span>
                    <span style={{color: 'white', fontWeight: 'bold'}}>{stats.conversionRate}%</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{color: '#cbd5e1'}}>Avg Quote Value</span>
                    <span style={{color: 'white', fontWeight: 'bold'}}>{formatCurrency(stats.averageQuoteValue)}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{color: '#cbd5e1'}}>Avg Invoice Value</span>
                    <span style={{color: 'white', fontWeight: 'bold'}}>{formatCurrency(stats.averageInvoiceValue)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Job History */}
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <h2 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Job History</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {jobHistory.length > 0 ? (
                jobHistory.map((job) => {
                  const statusColors = getStatusColor(job.status)
                  return (
                    <div key={job.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                        <div style={{padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: job.type === 'invoice' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(147, 51, 234, 0.2)'}}>
                          {job.type === 'invoice' ? (
                            <DollarSign style={{height: '1rem', width: '1rem', color: '#60a5fa'}} />
                          ) : (
                            <FileText style={{height: '1rem', width: '1rem', color: '#a78bfa'}} />
                          )}
                        </div>
                        <div>
                          <p style={{fontWeight: '500', color: 'white', fontSize: '0.875rem'}}>{job.title}</p>
                          <p style={{fontSize: '0.75rem', color: '#cbd5e1'}}>{job.reference} • {formatDate(job.date)}</p>
                        </div>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <p style={{fontWeight: '500', color: 'white', fontSize: '0.875rem'}}>{formatCurrency(job.amount)}</p>
                        <span style={{fontSize: '0.625rem', padding: '0.125rem 0.375rem', borderRadius: '9999px', backgroundColor: statusColors.bg, color: statusColors.color}}>{job.status}</span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{textAlign: 'center', padding: '2rem', color: '#cbd5e1'}}>
                  <FileText style={{height: '2rem', width: '2rem', margin: '0 auto 1rem', opacity: 0.5}} />
                  <p>No job history yet</p>
                  <p style={{fontSize: '0.75rem', marginTop: '0.5rem'}}>Create your first quote or invoice</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Email Modal */}
        {showEmailModal && (
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
            zIndex: 999999
          }}>
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold'}}>Send Email to {client?.name}</h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    padding: '0.25rem'
                  }}
                >
                  <X style={{height: '1.5rem', width: '1.5rem'}} />
                </button>
              </div>
              
              <div style={{marginBottom: '1.5rem'}}>
                <label style={{display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem'}}>
                  To: (Sandbox Mode - Sends to george@uniquitousmusic.com)
                </label>
                <input
                  type="email"
                  value="george@uniquitousmusic.com"
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#94a3b8',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{marginBottom: '1.5rem'}}>
                <label style={{display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem'}}>
                  Subject:
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                  placeholder="Enter email subject..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{marginBottom: '2rem'}}>
                <label style={{display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem'}}>
                  Message:
                </label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                  placeholder="Enter your message..."
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                <button
                  onClick={() => setShowEmailModal(false)}
                  disabled={sendingEmail}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: sendingEmail ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    opacity: sendingEmail ? 0.5 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={!emailForm.subject.trim() || !emailForm.message.trim() || sendingEmail}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: (!emailForm.subject.trim() || !emailForm.message.trim() || sendingEmail) ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: (!emailForm.subject.trim() || !emailForm.message.trim() || sendingEmail) ? 'not-allowed' : 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
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
            zIndex: 999999
          }}>
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              padding: '2rem',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Delete Client</h3>
              <p style={{color: '#cbd5e1', marginBottom: '2rem'}}>
                Are you sure you want to delete {getClientName(client)}? This action cannot be undone.
              </p>
              <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
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
                <button
                  onClick={handleDeleteClient}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#ef4444',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
