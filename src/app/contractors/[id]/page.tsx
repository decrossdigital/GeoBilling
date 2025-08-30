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
  X,
  Wrench,
  Briefcase
} from "lucide-react"

interface Contractor {
  id: string
  name: string
  email: string
  phone: string
  address: string
  skills: string[]
  pricingType: "hourly" | "flat"
  rate: number
  currency: string
  status: "active" | "inactive"
  notes: string
  createdAt: string
  updatedAt: string
}

interface ContractorStats {
  totalProjects: number
  totalHours: number
  totalEarnings: number
  averageRate: number
  lastActivity: string
  completionRate: number
}

interface ProjectHistory {
  id: string
  projectName: string
  hours: number
  rate: number
  amount: number
  date: string
  status: string
  clientName: string
}

interface Note {
  id: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function ContractorDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const contractorId = params.id as string

  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [stats, setStats] = useState<ContractorStats | null>(null)
  const [projectHistory, setProjectHistory] = useState<ProjectHistory[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editing, setEditing] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    skills: [] as string[],
    pricingType: "hourly" as "hourly" | "flat",
    rate: 0,
    currency: "USD",
    notes: "",
    status: "active" as "active" | "inactive"
  })
  const [skillsInput, setSkillsInput] = useState("")

  useEffect(() => {
    const fetchContractorData = async () => {
      if (!session || !contractorId) return

      try {
        setLoading(true)
        
        // Fetch contractor details
        const contractorResponse = await fetch(`/api/contractors/${contractorId}`)
        if (contractorResponse.ok) {
          const contractorData = await contractorResponse.json()
          setContractor(contractorData)
          setEditForm({
            name: contractorData.name,
            email: contractorData.email,
            phone: contractorData.phone,
            address: contractorData.address,
            skills: contractorData.skills || [],
            pricingType: contractorData.pricingType,
            rate: contractorData.rate,
            currency: contractorData.currency,
            notes: contractorData.notes || "",
            status: contractorData.status
          })
          setSkillsInput(contractorData.skills?.join(', ') || "")
        }

        // Fetch contractor statistics (placeholder for now)
        setStats({
          totalProjects: 12,
          totalHours: 156,
          totalEarnings: 23400,
          averageRate: 150,
          lastActivity: new Date().toISOString(),
          completionRate: 95
        })

        // Fetch project history (placeholder for now)
        setProjectHistory([
          {
            id: "1",
            projectName: "Album Mixing",
            hours: 24,
            rate: 150,
            amount: 3600,
            date: new Date().toISOString(),
            status: "completed",
            clientName: "Client A"
          }
        ])

        // Fetch notes (placeholder for now)
        setNotes([])

      } catch (error) {
        console.error('Error fetching contractor data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContractorData()
  }, [session, contractorId])

  const handleSaveEdit = async () => {
    if (!contractor) return

    // Basic validation
    if (!editForm.name.trim()) {
      alert('Contractor name is required')
      return
    }

    if (!editForm.email.trim()) {
      alert('Email is required')
      return
    }

    try {
      const response = await fetch(`/api/contractors/${contractorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          skills: skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
        }),
      })

      if (response.ok) {
        const updatedContractor = await response.json()
        setContractor(updatedContractor)
        setEditing(false)
        alert('Contractor updated successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to update contractor: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating contractor:', error)
      alert('Failed to update contractor. Please try again.')
    }
  }

  const handleDeleteContractor = async () => {
    if (!contractor) return

    try {
      const response = await fetch(`/api/contractors/${contractorId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/contractors')
      }
    } catch (error) {
      console.error('Error deleting contractor:', error)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      // For now, just add to local state
      const note = {
        id: Date.now().toString(),
        content: newNote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setNotes([note, ...notes])
      setNewNote("")
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      setNotes(notes.filter(note => note.id !== noteId))
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
      case 'completed':
        return { bg: 'rgba(34, 197, 94, 0.2)', color: '#34d399' }
      case 'pending':
        return { bg: 'rgba(251, 146, 60, 0.2)', color: '#fb923c' }
      case 'active':
        return { bg: 'rgba(34, 197, 94, 0.2)', color: '#34d399' }
      case 'inactive':
        return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }
      default:
        return { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }
    }
  }

  if (loading) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '1.5rem', marginBottom: '1rem'}}>Loading contractor...</div>
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

  if (!contractor) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '1.5rem', marginBottom: '1rem'}}>Contractor not found</div>
          <Link href="/contractors" style={{color: '#60a5fa', textDecoration: 'none'}}>Back to Contractors</Link>
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
              <Link href="/contractors" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'linear-gradient(to right, #9333ea, #3b82f6)', color: 'white', textDecoration: 'none', fontWeight: '500', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}>
                <User style={{height: '1rem', width: '1rem'}} />
                <span>Contractors</span>
              </Link>
              <Link href="/quotes" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <FileText style={{height: '1rem', width: '1rem'}} />
                <span>Quotes</span>
              </Link>
              <Link href="/invoices" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <DollarSign style={{height: '1rem', width: '1rem'}} />
                <span>Invoices</span>
              </Link>
              <Link href="/services" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <Settings style={{height: '1rem', width: '1rem'}} />
                <span>Services</span>
              </Link>
            </div>
            <UserMenu />
          </div>
        </div>

        {/* Back to Contractors Link */}
        <div style={{marginBottom: '2rem'}}>
          <Link href="/contractors" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', textDecoration: 'none', fontSize: '0.875rem'}}>
            <ArrowLeft style={{height: '1rem', width: '1rem'}} />
            Back to Contractors
          </Link>
        </div>
        {/* Contractor Header with Contact Information */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '2rem', marginBottom: '2rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div style={{flex: 1}}>
              <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      color: 'white',
                      fontSize: '2.25rem',
                      fontWeight: 'bold',
                      width: '300px'
                    }}
                    placeholder="Enter contractor name"
                  />
                ) : (
                  contractor.name
                )}
              </h1>
              
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
                      contractor.email
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
                      contractor.phone || <span style={{color: '#94a3b8', fontStyle: 'italic'}}>No phone provided</span>
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
                      contractor.address || <span style={{color: '#94a3b8', fontStyle: 'italic'}}>No address provided</span>
                    )}
                  </span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <Wrench style={{height: '1rem', width: '1rem', color: '#cbd5e1'}} />
                  <span style={{color: 'white'}}>
                    {editing ? (
                      <input
                        type="text"
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '0.25rem',
                          padding: '0.25rem',
                          color: 'white',
                          width: '250px'
                        }}
                        placeholder="Enter skills (comma separated)"
                      />
                    ) : (
                      contractor.skills?.join(', ') || <span style={{color: '#94a3b8', fontStyle: 'italic'}}>No skills listed</span>
                    )}
                  </span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <DollarSign style={{height: '1rem', width: '1rem', color: '#cbd5e1'}} />
                  <span style={{color: 'white'}}>
                    {editing ? (
                      <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                        <select
                          value={editForm.pricingType}
                          onChange={(e) => setEditForm({...editForm, pricingType: e.target.value as "hourly" | "flat"})}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.25rem',
                            padding: '0.25rem',
                            color: 'white',
                            width: '80px'
                          }}
                        >
                          <option value="hourly">Hourly</option>
                          <option value="flat">Flat</option>
                        </select>
                        <input
                          type="number"
                          value={editForm.rate}
                          onChange={(e) => setEditForm({...editForm, rate: parseFloat(e.target.value) || 0})}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.25rem',
                            padding: '0.25rem',
                            color: 'white',
                            width: '100px'
                          }}
                          placeholder="Rate"
                        />
                      </div>
                    ) : (
                      `${formatCurrency(contractor.rate)}/${contractor.pricingType === 'hourly' ? 'hour' : 'project'}`
                    )}
                  </span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <Calendar style={{height: '1rem', width: '1rem', color: '#cbd5e1'}} />
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Contractor since {formatDate(contractor.createdAt)}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '50%',
                    backgroundColor: (editing ? editForm.status : contractor.status) === 'active' ? '#34d399' : '#ef4444'
                  }} />
                  <span style={{color: '#cbd5e1', fontSize: '0.875rem'}}>
                    Status: <span style={{color: 'white', fontWeight: '500', textTransform: 'capitalize'}}>{editing ? editForm.status : contractor.status}</span>
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
                          name: contractor.name,
                          email: contractor.email,
                          phone: contractor.phone,
                          address: contractor.address,
                          skills: contractor.skills || [],
                          pricingType: contractor.pricingType,
                          rate: contractor.rate,
                          currency: contractor.currency,
                          notes: contractor.notes || "",
                          status: contractor.status
                        })
                        setSkillsInput(contractor.skills?.join(', ') || "")
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
                    Delete Contractor
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
            onClick={() => router.push(`/quotes/new?contractorId=${contractorId}`)}
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
            Assign to Quote
          </button>
          <button
            onClick={() => router.push(`/invoices/new?contractorId=${contractorId}`)}
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
            Assign to Invoice
          </button>
          <a
            href={`mailto:${contractor.email}`}
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
            <Mail style={{height: '1rem', width: '1rem'}} />
            Email
          </a>
          <a
            href={`tel:${contractor.phone}`}
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
                  placeholder="Add a note about this contractor..."
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

            {/* Contractor Statistics */}
            {stats && (
              <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
                <h2 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Statistics</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{color: '#cbd5e1'}}>Total Projects</span>
                    <span style={{color: 'white', fontWeight: 'bold'}}>{stats.totalProjects}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{color: '#cbd5e1'}}>Total Hours</span>
                    <span style={{color: 'white', fontWeight: 'bold'}}>{stats.totalHours}h</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{color: '#cbd5e1'}}>Total Earnings</span>
                    <span style={{color: 'white', fontWeight: 'bold'}}>{formatCurrency(stats.totalEarnings)}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{color: '#cbd5e1'}}>Average Rate</span>
                    <span style={{color: 'white', fontWeight: 'bold'}}>{formatCurrency(stats.averageRate)}/h</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{color: '#cbd5e1'}}>Completion Rate</span>
                    <span style={{color: 'white', fontWeight: 'bold'}}>{stats.completionRate}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Project History */}
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <h2 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Project History</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {projectHistory.length > 0 ? (
                projectHistory.map((project) => {
                  const statusColors = getStatusColor(project.status)
                  return (
                    <div key={project.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                        <div style={{padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.2)'}}>
                          <Briefcase style={{height: '1rem', width: '1rem', color: '#60a5fa'}} />
                        </div>
                        <div>
                          <p style={{fontWeight: '500', color: 'white', fontSize: '0.875rem'}}>{project.projectName}</p>
                          <p style={{fontSize: '0.75rem', color: '#cbd5e1'}}>{project.clientName} • {formatDate(project.date)}</p>
                        </div>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <p style={{fontWeight: '500', color: 'white', fontSize: '0.875rem'}}>{formatCurrency(project.amount)}</p>
                        <p style={{fontSize: '0.75rem', color: '#cbd5e1'}}>{project.hours}h @ {formatCurrency(project.rate)}/h</p>
                        <span style={{fontSize: '0.625rem', padding: '0.125rem 0.375rem', borderRadius: '9999px', backgroundColor: statusColors.bg, color: statusColors.color}}>{project.status}</span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{textAlign: 'center', padding: '2rem', color: '#cbd5e1'}}>
                  <Briefcase style={{height: '2rem', width: '2rem', margin: '0 auto 1rem', opacity: 0.5}} />
                  <p>No project history yet</p>
                  <p style={{fontSize: '0.75rem', marginTop: '0.5rem'}}>Assign contractor to quotes or invoices</p>
                </div>
              )}
            </div>
          </div>
        </div>

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
              <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Delete Contractor</h3>
              <p style={{color: '#cbd5e1', marginBottom: '2rem'}}>
                Are you sure you want to delete {contractor.name}? This action cannot be undone.
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
                  onClick={handleDeleteContractor}
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
