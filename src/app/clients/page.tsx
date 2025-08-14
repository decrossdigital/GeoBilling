"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import UserMenu from "@/components/user-menu"
import { Plus, Search, Edit, Trash2, Mail, Phone, Users, FileText, DollarSign, TrendingUp, Music, Home, X, Save, User, BarChart3, Settings, ExternalLink } from "lucide-react"

interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  address?: string
  createdAt: string
  updatedAt: string
}

export default function ClientsPage() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const [newClient, setNewClient] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: ""
  })

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
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
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchClients()
    }
  }, [session])

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalClients = clients.length
  const activeClients = totalClients // All clients are considered active for now
  const totalRevenue = 0 // This would be calculated from invoices
  const avgRevenue = totalClients > 0 ? totalRevenue / totalClients : 0

  const handleAddClient = async () => {
    if (newClient.name && newClient.email) {
      try {
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newClient),
        })

        if (response.ok) {
          const createdClient = await response.json()
          setClients([createdClient, ...clients])
          setNewClient({ name: "", company: "", email: "", phone: "", address: "" })
          setShowAddModal(false)
        } else {
          console.error('Failed to create client')
        }
      } catch (error) {
        console.error('Error creating client:', error)
      }
    }
  }

  const handleEditClient = () => {
    if (editingClient && editingClient.name && editingClient.email) {
      // This will be implemented with the API
      console.log('Edit client:', editingClient)
      setEditingClient(null)
    }
  }

  const handleDeleteClient = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setClients(clients.filter(client => client.id !== id))
      } else {
        console.error('Failed to delete client')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_blank')
  }

  const handlePhone = (phone: string) => {
    window.open(`tel:${phone}`, '_blank')
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

        {/* Page Header */}
        <div style={{marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
            <div>
              <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white'}}>Clients</h1>
              <p style={{color: '#cbd5e1'}}>Manage your client relationships and contact information</p>
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
              Add Client
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Total Clients</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>{totalClients}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>registered clients</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', borderRadius: '0.75rem'}}>
                <Users style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Active Clients</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>{activeClients}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>currently working</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #10b981, #14b8a6)', borderRadius: '0.75rem'}}>
                <Users style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Total Revenue</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>${totalRevenue.toLocaleString()}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>from all clients</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #059669, #0d9488)', borderRadius: '0.75rem'}}>
                <DollarSign style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Avg Revenue</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>${avgRevenue.toLocaleString()}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>per client</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #f59e0b, #f97316)', borderRadius: '0.75rem'}}>
                <TrendingUp style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
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
                placeholder="Search clients by name, company, or email..."
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

        {/* Clients Table */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', overflow: 'hidden'}}>
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: 'rgba(255, 255, 255, 0.05)'}}>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Client</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Company</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Contact</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Projects</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Revenue</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Last Contact</th>
                  
                                        <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} style={{textAlign: 'center', padding: '2rem'}}>Loading clients...</td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{textAlign: 'center', padding: '2rem'}}>No clients found.</td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} style={{borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}>
                      <td style={{padding: '1rem'}}>
                        <div style={{fontWeight: '500', color: 'white'}}>{client.name}</div>
                      </td>
                      <td style={{padding: '1rem'}}>
                        <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{client.company}</div>
                      </td>
                      <td style={{padding: '1rem'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                          <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{client.email}</div>
                          <div style={{fontSize: '0.875rem', color: '#94a3b8'}}>{client.phone}</div>
                        </div>
                      </td>
                                             <td style={{padding: '1rem'}}>
                         <div style={{fontWeight: '500', color: 'white'}}>0</div>
                       </td>
                       <td style={{padding: '1rem'}}>
                         <div style={{fontWeight: '500', color: 'white'}}>$0</div>
                       </td>
                       <td style={{padding: '1rem'}}>
                         <div style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{new Date(client.createdAt).toLocaleDateString()}</div>
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
                           backgroundColor: 'rgba(52, 211, 153, 0.1)',
                           color: '#34d399'
                         }}>
                           <div style={{
                             width: '0.5rem',
                             height: '0.5rem',
                             borderRadius: '50%',
                             backgroundColor: '#34d399'
                           }} />
                           active
                         </div>
                       </td>
                      <td style={{padding: '1rem'}}>
                        <Link
                          href={`/clients/${client.id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '0.25rem',
                            color: '#60a5fa',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            fontWeight: '500',
                            fontSize: '0.875rem'
                          }}
                        >
                          <ExternalLink style={{height: '1rem', width: '1rem'}} />
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Client Modal */}
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
              maxWidth: '500px',
              width: '90%'
            }}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white'}}>Add New Client</h2>
                <button
                  onClick={() => setShowAddModal(false)}
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
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Name *</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    style={{width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', color: 'white', outline: 'none'}}
                    placeholder="Enter client name"
                  />
                </div>
                
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Company</label>
                  <input
                    type="text"
                    value={newClient.company}
                    onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                    style={{width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', color: 'white', outline: 'none'}}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Email *</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    style={{width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', color: 'white', outline: 'none'}}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    style={{width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', color: 'white', outline: 'none'}}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClient}
                  disabled={!newClient.name || !newClient.email}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: (!newClient.name || !newClient.email) ? 'not-allowed' : 'pointer',
                    flex: 1,
                    opacity: (!newClient.name || !newClient.email) ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Save style={{height: '1rem', width: '1rem'}} />
                  Add Client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Client Modal */}
        {editingClient && (
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
              width: '90%'
            }}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white'}}>Edit Client</h2>
                <button
                  onClick={() => setEditingClient(null)}
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
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Name *</label>
                  <input
                    type="text"
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                    style={{width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', color: 'white', outline: 'none'}}
                  />
                </div>
                
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Company</label>
                  <input
                    type="text"
                    value={editingClient.company}
                    onChange={(e) => setEditingClient({...editingClient, company: e.target.value})}
                    style={{width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', color: 'white', outline: 'none'}}
                  />
                </div>
                
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Email *</label>
                  <input
                    type="email"
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                    style={{width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', color: 'white', outline: 'none'}}
                  />
                </div>
                
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Phone</label>
                  <input
                    type="tel"
                    value={editingClient.phone}
                    onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                    style={{width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', color: 'white', outline: 'none'}}
                  />
                </div>
                

              </div>
              
              <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                <button
                  onClick={() => setEditingClient(null)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditClient}
                  disabled={!editingClient.name || !editingClient.email}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: (!editingClient.name || !editingClient.email) ? 'not-allowed' : 'pointer',
                    flex: 1,
                    opacity: (!editingClient.name || !editingClient.email) ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Save style={{height: '1rem', width: '1rem'}} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
