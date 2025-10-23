'use client'

import { Plus, Users, Trash2 } from 'lucide-react'

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

interface QuoteContractor {
  id: string
  contractorId: string
  assignedSkills: string[]
  rateType: string
  hours: number | null
  cost: number
  includeInTotal: boolean
  contractor: Contractor
}

interface QuoteContractorsProps {
  contractors: QuoteContractor[]
  onAddContractor: () => void
  onRemoveContractor: (contractorId: string) => void
  onToggleIncludeInTotal?: (contractorId: string, include: boolean) => void
  isDraft?: boolean
}

export default function QuoteContractors({ 
  contractors, 
  onAddContractor,
  onRemoveContractor,
  onToggleIncludeInTotal,
  isDraft = true
}: QuoteContractorsProps) {
  const totalContractorCost = contractors
    .filter(c => c.includeInTotal)
    .reduce((sum, c) => sum + Number(c.cost), 0)

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '0.75rem',
      padding: '1.5rem'
    }}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
        <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0}}>Contractors</h2>
        {isDraft && (
          <button
            onClick={onAddContractor}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'linear-gradient(to right, #9333ea, #c026d3)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            <Plus style={{height: '1rem', width: '1rem'}} />
            Add Contractor
          </button>
        )}
      </div>
      
      {contractors.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#cbd5e1'
        }}>
          <Users style={{height: '2rem', width: '2rem', margin: '0 auto 0.5rem auto', opacity: 0.5}} />
          <p style={{fontSize: '0.875rem', margin: 0}}>No contractors assigned</p>
          {isDraft && (
            <p style={{fontSize: '0.75rem', color: '#94a3b8', margin: '0.5rem 0 0 0'}}>
              Click "Add Contractor" to assign contractors to this quote
            </p>
          )}
        </div>
      ) : (
        <>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem'}}>
            {contractors.map((qc) => (
              <div
                key={qc.id}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                  <div style={{flex: 1}}>
                    <p style={{color: 'white', fontWeight: '500', marginBottom: '0.25rem', fontSize: '1rem'}}>
                      {qc.contractor.name}
                    </p>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.25rem'}}>
                      {qc.assignedSkills.map(skill => (
                        <span
                          key={skill}
                          style={{
                            padding: '0.125rem 0.5rem',
                            backgroundColor: 'rgba(147, 51, 234, 0.2)',
                            border: '1px solid rgba(147, 51, 234, 0.3)',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            color: '#e9d5ff'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p style={{color: '#94a3b8', fontSize: '0.75rem', margin: 0}}>
                      {qc.rateType === 'hourly' 
                        ? `${qc.hours} hrs @ $${qc.hours && qc.hours > 0 ? (qc.cost / qc.hours).toFixed(2) : '0.00'}/hr`
                        : 'Flat rate'
                      }
                      {!qc.includeInTotal && (
                        <span style={{color: '#f59e0b', marginLeft: '0.5rem'}}>
                          (Not included in total)
                        </span>
                      )}
                    </p>
                  </div>
                  <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem'}}>
                    <p style={{color: 'white', fontWeight: 'bold', fontSize: '1rem', margin: 0}}>
                      ${Number(qc.cost).toFixed(2)}
                    </p>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem'}}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: '#cbd5e1'
                      }}>
                        <input
                          type="checkbox"
                          checked={qc.includeInTotal}
                          onChange={(e) => onToggleIncludeInTotal && onToggleIncludeInTotal(qc.id, e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>Include in total</span>
                      </label>
                      {isDraft && (
                        <button
                          onClick={() => onRemoveContractor(qc.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            color: '#fca5a5',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}
                        >
                          <Trash2 style={{height: '0.75rem', width: '0.75rem'}} />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
