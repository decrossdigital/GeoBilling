'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import UserMenu from '@/components/user-menu'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Music,
  Headphones,
  Mic,
  Clock,
  Tag,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react'
import Navigation from '@/components/navigation'

interface ServiceTemplate {
  id: string
  name: string
  description: string
  category: string
  pricingType: 'hourly' | 'flat'
  rate: number
  currency: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ServicesPage() {
  const { data: session } = useSession()
  const [services, setServices] = useState<ServiceTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [pricingTypeFilter, setPricingTypeFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingService, setEditingService] = useState<ServiceTemplate | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'recording',
    pricingType: 'flat' as 'hourly' | 'flat',
    rate: '',
    isActive: true
  })

  useEffect(() => {
    if (session) {
      fetchServices()
    }
  }, [session])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/service-templates')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with data:', formData)
    
    try {
      const url = editingService 
        ? `/api/service-templates/${editingService.id}`
        : '/api/service-templates'
      
      const method = editingService ? 'PUT' : 'POST'
      
      const requestBody = {
        ...formData,
        rate: parseFloat(formData.rate)
      }
      
      console.log('Sending request to:', url, 'with method:', method)
      console.log('Request body:', requestBody)
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Success:', result)
        setShowAddModal(false)
        setEditingService(null)
        resetForm()
        fetchServices()
      } else {
        const errorText = await response.text()
        console.error('Failed to save service:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error saving service:', error)
    }
  }

  const handleEdit = (service: ServiceTemplate) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      category: service.category,
      pricingType: service.pricingType,
      rate: service.rate.toString(),
      isActive: service.isActive
    })
    setShowAddModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/service-templates/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDeleteConfirm(null)
        fetchServices()
      } else {
        console.error('Failed to delete service')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'recording',
      pricingType: 'flat',
      rate: '',
      isActive: true
    })
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter
    const matchesPricingType = pricingTypeFilter === 'all' || service.pricingType === pricingTypeFilter
    
    return matchesSearch && matchesCategory && matchesPricingType
  })

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'recording': return <Mic className="h-4 w-4" />
      case 'mixing': return <Headphones className="h-4 w-4" />
      case 'mastering': return <Music className="h-4 w-4" />
      case 'production': return <Music className="h-4 w-4" />
      default: return <Tag className="h-4 w-4" />
    }
  }

  const getPricingTypeLabel = (pricingType: string) => {
    return pricingType === 'hourly' ? 'Per Hour' : 'Flat Rate'
  }

  if (!session) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem'}}>
          <div style={{textAlign: 'center', padding: '4rem 0'}}>
            <h1 style={{fontSize: '2rem', marginBottom: '1rem'}}>Please sign in to access services</h1>
          </div>
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
        <Navigation />

        {/* Page Header */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem'}}>
          <div>
            <h2 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Services</h2>
            <p style={{color: '#cbd5e1'}}>Manage your service templates for quotes and invoices</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setEditingService(null)
              setShowAddModal(true)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(to right, #2563eb, #4f46e5)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Plus style={{height: '1rem', width: '1rem'}} />
            Add Service
          </button>
        </div>

        {/* Filters */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem'}}>
          <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
            <div style={{flex: '1', minWidth: '200px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                <Search style={{height: '1rem', width: '1rem', color: '#cbd5e1'}} />
                <span style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Search</span>
              </div>
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            
            <div style={{minWidth: '150px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                <Filter style={{height: '1rem', width: '1rem', color: '#cbd5e1'}} />
                <span style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Category</span>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <option value="all">All Categories</option>
                <option value="recording">Recording</option>
                <option value="mixing">Mixing</option>
                <option value="mastering">Mastering</option>
                <option value="production">Production</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{minWidth: '150px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                <Clock style={{height: '1rem', width: '1rem', color: '#cbd5e1'}} />
                <span style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Pricing Type</span>
              </div>
              <select
                value={pricingTypeFilter}
                onChange={(e) => setPricingTypeFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <option value="all">All Types</option>
                <option value="hourly">Per Hour</option>
                <option value="flat">Flat Rate</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div style={{textAlign: 'center', padding: '4rem 0'}}>
            <div style={{fontSize: '1.125rem', color: '#cbd5e1'}}>Loading services...</div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div style={{textAlign: 'center', padding: '4rem 0'}}>
            <div style={{fontSize: '1.125rem', color: '#cbd5e1', marginBottom: '1rem'}}>
              {searchTerm || categoryFilter !== 'all' || pricingTypeFilter !== 'all' 
                ? 'No services match your filters' 
                : 'No services found'}
            </div>
            {!searchTerm && categoryFilter === 'all' && pricingTypeFilter === 'all' && (
              <button
                onClick={() => {
                  resetForm()
                  setEditingService(null)
                  setShowAddModal(true)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(to right, #9333ea, #ec4899)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  margin: '0 auto'
                }}
              >
                <Plus style={{height: '1rem', width: '1rem'}} />
                Add Your First Service
              </button>
            )}
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem'}}>
            {filteredServices.map((service) => (
              <div
                key={service.id}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  transition: 'all 0.2s',
                  opacity: service.isActive ? 1 : 0.6
                }}
              >
                <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <div style={{
                      padding: '0.5rem',
                      background: 'rgba(147, 51, 234, 0.2)',
                      borderRadius: '0.5rem',
                      color: '#a855f7'
                    }}>
                      {getCategoryIcon(service.category)}
                    </div>
                    <div>
                      <h3 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem'}}>
                        {service.name}
                      </h3>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          background: service.pricingType === 'hourly' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: service.pricingType === 'hourly' ? '#22c55e' : '#3b82f6',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {getPricingTypeLabel(service.pricingType)}
                        </span>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: '#cbd5e1',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {service.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{position: 'relative'}}>
                    <button
                      onClick={() => setDeleteConfirm(service.id)}
                      style={{
                        padding: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        borderRadius: '0.25rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <MoreVertical style={{height: '1rem', width: '1rem'}} />
                    </button>
                  </div>
                </div>

                {service.description && (
                  <p style={{color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.5'}}>
                    {service.description}
                  </p>
                )}

                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <div style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#22c55e'}}>
                    ${service.rate}
                    <span style={{fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 'normal'}}>
                      {service.pricingType === 'hourly' ? '/hour' : ''}
                    </span>
                  </div>
                  
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button
                      onClick={() => handleEdit(service)}
                      style={{
                        padding: '0.5rem',
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '0.5rem',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Edit style={{height: '1rem', width: '1rem'}} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(service.id)}
                      style={{
                        padding: '0.5rem',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '0.5rem',
                        color: '#ef4444',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Trash2 style={{height: '1rem', width: '1rem'}} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'linear-gradient(to bottom right, #1e293b, #334155)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '1rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem'}}>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1'}}>
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1'}}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1'}}>
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="recording">Recording</option>
                      <option value="mixing">Mixing</option>
                      <option value="mastering">Mastering</option>
                      <option value="production">Production</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1'}}>
                      Pricing Type *
                    </label>
                    <select
                      required
                      value={formData.pricingType}
                      onChange={(e) => setFormData({...formData, pricingType: e.target.value as 'hourly' | 'flat'})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="flat">Flat Rate</option>
                      <option value="hourly">Per Hour</option>
                    </select>
                  </div>
                </div>

                <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1'}}>
                    Rate (USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({...formData, rate: e.target.value})}
                    placeholder={formData.pricingType === 'hourly' ? '75.00' : '500.00'}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}
                  />
                  <div style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem'}}>
                    {formData.pricingType === 'hourly' ? 'Enter hourly rate (e.g., $75/hour)' : 'Enter flat rate (e.g., $500/session)'}
                  </div>
                </div>

                <div style={{marginBottom: '1.5rem'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1'}}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      style={{accentColor: '#9333ea'}}
                    />
                    Active Service
                  </label>
                </div>

                <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingService(null)
                      resetForm()
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(to right, #9333ea, #ec4899)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {editingService ? 'Update Service' : 'Add Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'linear-gradient(to bottom right, #1e293b, #334155)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '1rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '400px'
            }}>
              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>
                Delete Service
              </h3>
              <p style={{color: '#cbd5e1', marginBottom: '1.5rem'}}>
                Are you sure you want to delete this service? This action cannot be undone.
              </p>
              <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(to right, #ef4444, #dc2626)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
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
