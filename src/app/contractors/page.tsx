"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Plus, Search, Eye, Edit, DollarSign, Clock, CheckCircle, User, Music, Headphones, Mic, X, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import UserMenu from "@/components/user-menu"
import Navigation from "@/components/navigation"

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

interface ContractorWork {
  id: string
  contractorId: string
  projectName: string
  hours: number
  rate: number
  amount: number
  date: string
  status: "pending" | "paid"
}

export default function ContractorsPage() {
  const { data: session } = useSession()
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showWorkModal, setShowWorkModal] = useState(false)
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null)
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null)

  const [newContractor, setNewContractor] = useState({
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

  // Separate state for skills input to allow free typing
  const [skillsInput, setSkillsInput] = useState("")

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
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchContractors()
    }
  }, [session])

  const filteredContractors = contractors.filter(contractor =>
    contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contractor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contractor.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalContractors = contractors.length
  const activeContractors = contractors.filter(c => c.status === "active").length
  const totalHourlyRate = contractors.reduce((sum, c) => sum + parseFloat(c.rate.toString()), 0)
  const avgHourlyRate = totalContractors > 0 ? totalHourlyRate / totalContractors : 0

  const handleAddContractor = async () => {
    if (newContractor.name && newContractor.email) {
      // Parse skills from input
      const skills = skillsInput
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)
      
      const contractorData = {
        ...newContractor,
        skills
      }
      
      console.log('Submitting contractor:', contractorData)
      try {
        const response = await fetch('/api/contractors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contractorData),
        })

        if (response.ok) {
          const createdContractor = await response.json()
          setContractors([createdContractor, ...contractors])
          setNewContractor({
            name: "",
            email: "",
            phone: "",
            address: "",
            skills: [],
            pricingType: "hourly",
            rate: 0,
            currency: "USD",
            notes: "",
            status: "active"
          })
          setSkillsInput("")
          setShowAddModal(false)
        } else {
          console.error('Failed to create contractor')
        }
      } catch (error) {
        console.error('Error creating contractor:', error)
      }
    }
  }

  const handleEditContractor = (contractor: Contractor) => {
    setEditingContractor(contractor)
    setSkillsInput((contractor.skills || []).join(', '))
    setShowAddModal(true)
  }

  const handleSaveEdit = async () => {
    if (editingContractor && editingContractor.name && editingContractor.email) {
      // Parse skills from input
      const skills = skillsInput
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)
      
      const contractorData = {
        ...editingContractor,
        skills
      }
      
      try {
        console.log('Submitting edited contractor data:', contractorData)
        const response = await fetch(`/api/contractors/${editingContractor.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contractorData),
        })

        if (response.ok) {
          const updatedContractor = await response.json()
          setContractors(contractors.map(c => c.id === updatedContractor.id ? updatedContractor : c))
          setEditingContractor(null)
          setShowAddModal(false)
        } else {
          console.error('Failed to update contractor')
        }
      } catch (error) {
        console.error('Error updating contractor:', error)
      }
    }
  }

  const handleDeleteContractor = async (id: string) => {
    try {
      const response = await fetch(`/api/contractors/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setContractors(contractors.filter(contractor => contractor.id !== id))
      } else {
        console.error('Failed to delete contractor')
      }
    } catch (error) {
      console.error('Error deleting contractor:', error)
    }
  }

  const handleViewWork = (contractor: Contractor) => {
    setSelectedContractor(contractor)
    setShowWorkModal(true)
  }

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty.toLowerCase()) {
      case "mixing engineer":
        return <Headphones style={{height: '1rem', width: '1rem'}} />
      case "mastering engineer":
        return <Music style={{height: '1rem', width: '1rem'}} />
      case "audio editor":
        return <Mic style={{height: '1rem', width: '1rem'}} />
      default:
        return <User style={{height: '1rem', width: '1rem'}} />
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "#34d399" : "#f87171"
  }

  const getWorkStatusColor = (status: string) => {
    return status === "paid" ? "#34d399" : "#fbbf24"
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
        <Navigation />

        {/* Page Header */}
        <div style={{marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
            <div>
              <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white'}}>Contractors</h1>
              <p style={{color: '#cbd5e1'}}>Manage your freelance contractors and their work</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500'
              }}
            >
              <Plus style={{height: '1rem', width: '1rem'}} />
              Add Contractor
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Total Contractors</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>{totalContractors}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>freelancers</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', borderRadius: '0.75rem'}}>
                <User style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Active Contractors</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>{activeContractors}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>currently working</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #10b981, #14b8a6)', borderRadius: '0.75rem'}}>
                <CheckCircle style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Pending Payments</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>${avgHourlyRate.toFixed(0)}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>avg rate</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #f59e0b, #f97316)', borderRadius: '0.75rem'}}>
                <Clock style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Total Paid</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>${totalHourlyRate.toLocaleString()}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>total rate</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #059669, #0d9488)', borderRadius: '0.75rem'}}>
                <DollarSign style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div style={{position: 'relative', flex: 1}}>
              <Search style={{position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', height: '1rem', width: '1rem', color: '#94a3b8'}} />
              <input
                type="text"
                placeholder="Search contractors by name, specialty, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
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

        {/* Contractors Table */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', overflow: 'hidden'}}>
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: 'rgba(255, 255, 255, 0.05)'}}>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Contractor</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Skills</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Rate</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Status</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContractors.map((contractor) => (
                  <tr key={contractor.id} style={{borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}>
                    <td style={{padding: '1rem'}}>
                      <div>
                        <div style={{fontWeight: '500', color: 'white', marginBottom: '0.25rem'}}>{contractor.name}</div>
                        <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{contractor.email}</div>
                        <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>{contractor.phone}</div>
                      </div>
                    </td>
                    <td style={{padding: '1rem'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        {getSpecialtyIcon(contractor.skills[0])}
                        <span style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{contractor.skills[0]}</span>
                      </div>
                    </td>
                    <td style={{padding: '1rem'}}>
                      <div style={{fontWeight: '500', color: 'white'}}>
                        ${contractor.rate}{contractor.pricingType === 'hourly' ? '/hr' : ''}
                      </div>
                    </td>
                    <td style={{padding: '1rem'}}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: contractor.status === "active" ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                        color: getStatusColor(contractor.status)
                      }}>
                        <div style={{
                          width: '0.5rem',
                          height: '0.5rem',
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(contractor.status)
                        }} />
                        {contractor.status}
                      </div>
                    </td>
                    <td style={{padding: '1rem'}}>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                          onClick={() => handleViewWork(contractor)}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.25rem',
                            color: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye style={{height: '1rem', width: '1rem'}} />
                        </button>
                        <button
                          onClick={() => handleEditContractor(contractor)}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.25rem',
                            color: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit style={{height: '1rem', width: '1rem'}} />
                        </button>
                        <button
                          onClick={() => handleDeleteContractor(contractor.id)}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.25rem',
                            color: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 style={{height: '1rem', width: '1rem'}} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Contractor Modal */}
        {showAddModal && (
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
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white'}}>{editingContractor ? 'Edit Contractor' : 'Add New Contractor'}</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSkillsInput("")
                    setEditingContractor(null)
                  }}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.25rem',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <X style={{height: '1rem', width: '1rem'}} />
                </button>
              </div>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem'}}>Name</label>
                  <input
                    type="text"
                    placeholder="Enter contractor name"
                    value={editingContractor?.name || newContractor.name}
                    onChange={(e) => editingContractor ? setEditingContractor({...editingContractor, name: e.target.value}) : setNewContractor({...newContractor, name: e.target.value})}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem'}}>Email</label>
                  <input
                    type="email"
                    placeholder="Enter contractor email"
                    value={editingContractor?.email || newContractor.email}
                    onChange={(e) => editingContractor ? setEditingContractor({...editingContractor, email: e.target.value}) : setNewContractor({...newContractor, email: e.target.value})}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem'}}>Phone</label>
                  <input
                    type="tel"
                    placeholder="Enter contractor phone (optional)"
                    value={editingContractor?.phone || newContractor.phone}
                    onChange={(e) => editingContractor ? setEditingContractor({...editingContractor, phone: e.target.value}) : setNewContractor({...newContractor, phone: e.target.value})}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem'}}>Skills</label>
                  <input
                    type="text"
                    placeholder="e.g., mixing, mastering, recording, production"
                    value={editingContractor ? (editingContractor.skills || []).join(', ') : skillsInput}
                    onChange={(e) => {
                      console.log('Skills input changed:', e.target.value)
                      if (editingContractor) {
                        // For editing, just update the input state to allow free typing
                        setSkillsInput(e.target.value)
                      } else {
                        // For new contractor, just update the input state
                        setSkillsInput(e.target.value)
                      }
                    }}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem'}}>Pricing Type</label>
                  <select
                    value={editingContractor ? editingContractor.pricingType : newContractor.pricingType}
                    onChange={(e) => {
                      if (editingContractor) {
                        setEditingContractor({...editingContractor, pricingType: e.target.value as "hourly" | "flat"})
                      } else {
                        setNewContractor({...newContractor, pricingType: e.target.value as "hourly" | "flat"})
                      }
                    }}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none'
                    }}
                  >
                    <option value="hourly">Per Hour</option>
                    <option value="flat">Flat Rate</option>
                  </select>
                </div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem'}}>
                    {(editingContractor ? editingContractor.pricingType : newContractor.pricingType) === 'hourly' ? 'Hourly Rate' : 'Flat Rate'}
                  </label>
                  <input
                    type="number"
                    placeholder={(editingContractor ? editingContractor.pricingType : newContractor.pricingType) === 'hourly' ? "Enter hourly rate" : "Enter flat rate"}
                    value={editingContractor ? editingContractor.rate : newContractor.rate}
                    onChange={(e) => {
                      if (editingContractor) {
                        setEditingContractor({...editingContractor, rate: parseFloat(e.target.value)})
                      } else {
                        setNewContractor({...newContractor, rate: parseFloat(e.target.value)})
                      }
                    }}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem'}}>Status</label>
                  <select
                    value={editingContractor ? editingContractor.status : newContractor.status || "active"}
                    onChange={(e) => {
                      if (editingContractor) {
                        setEditingContractor({...editingContractor, status: e.target.value as "active" | "inactive"})
                      } else {
                        setNewContractor({...newContractor, status: e.target.value as "active" | "inactive"})
                      }
                    }}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      outline: 'none'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem'}}>Notes</label>
                  <textarea
                    placeholder="Enter contractor notes (optional)"
                    value={editingContractor?.notes || newContractor.notes}
                    onChange={(e) => {
                      if (editingContractor) {
                        setEditingContractor({...editingContractor, notes: e.target.value})
                      } else {
                        setNewContractor({...newContractor, notes: e.target.value})
                      }
                    }}
                    rows={3}
                    style={{
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
                <button
                  onClick={editingContractor ? handleSaveEdit : handleAddContractor}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '500'
                  }}
                >
                  {editingContractor ? <Save style={{height: '1rem', width: '1rem'}} /> : <Plus style={{height: '1rem', width: '1rem'}} />}
                  {editingContractor ? 'Save Changes' : 'Add Contractor'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Work Modal */}
        {showWorkModal && selectedContractor && (
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
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white'}}>{selectedContractor.name} - Work History</h2>
                <button
                  onClick={() => setShowWorkModal(false)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.25rem',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <X style={{height: '1rem', width: '1rem'}} />
                </button>
              </div>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div style={{
                  padding: '2rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'center',
                  color: '#cbd5e1'
                }}>
                  Work history will be implemented in Phase 3.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
