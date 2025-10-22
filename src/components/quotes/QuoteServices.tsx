'use client'

import { Plus, Trash2, FileText, Edit } from 'lucide-react'

interface Contractor {
  id: string
  name: string
  email: string
  phone: string
  hourlyRate: number
  flatRate: number
}

interface QuoteItem {
  id: string
  serviceName: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  contractorId: string | null
  contractor?: Contractor
  serviceTemplateId: string | null
  sortOrder: number
}

interface QuoteServicesProps {
  services: QuoteItem[]
  onAddService: () => void
  onEditService: (item: QuoteItem) => void
  onDeleteService: (itemId: string) => void
  isEditable?: boolean
}

export default function QuoteServices({ 
  services, 
  onAddService, 
  onEditService,
  onDeleteService,
  isEditable = true
}: QuoteServicesProps) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginBottom: '2rem'
    }}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
        <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0}}>Services</h2>
        {isEditable && (
          <button
            onClick={onAddService}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.25rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}
          >
            <Plus style={{height: '0.875rem', width: '0.875rem'}} />
            Add Service
          </button>
        )}
      </div>
      
      {services.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#cbd5e1'
        }}>
          <FileText style={{height: '2rem', width: '2rem', margin: '0 auto 0.5rem auto', opacity: 0.5}} />
          <p style={{fontSize: '0.875rem', margin: 0}}>No services added yet</p>
        </div>
      ) : (
        <div>
          {services.map((item, index) => (
            <div key={item.id} style={{
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '0.75rem'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                <div>
                  <p style={{fontSize: '1rem', color: 'white', fontWeight: '500', margin: 0}}>{item.serviceName}</p>
                  <p style={{fontSize: '0.875rem', color: '#cbd5e1', margin: '0.25rem 0 0 0'}}>{item.description}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{fontSize: '1rem', color: 'white', fontWeight: '500', margin: 0}}>${item.total.toFixed(2)}</p>
                  <p style={{fontSize: '0.75rem', color: '#cbd5e1', margin: 0}}>
                    {item.quantity} × ${item.unitPrice.toFixed(2)}
                  </p>
                </div>
              </div>
              {isEditable && (
                <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                  <button
                    onClick={() => onEditService(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '0.25rem',
                      color: '#60a5fa',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}
                  >
                    <Edit style={{height: '0.75rem', width: '0.75rem'}} />
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteService(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '0.25rem',
                      color: '#f87171',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}
                  >
                    <Trash2 style={{height: '0.75rem', width: '0.75rem'}} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
