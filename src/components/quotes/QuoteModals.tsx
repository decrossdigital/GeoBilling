'use client'

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

interface QuoteModalsProps {
  showEmailModal: boolean
  showAddServiceModal: boolean
  showEditServiceModal: boolean
  showAddContractorModal: boolean
  showEditContractorModal: boolean
  sendingEmail: boolean
  contractors: Contractor[]
  selectedContractor: string
  editingItem: QuoteItem | null
  serviceForm: {
    serviceName: string
    description: string
    quantity: number
    unitPrice: number
  }
  emailData: {
    to: string
    subject: string
    message: string
  }
  onCloseEmailModal: () => void
  onCloseAddServiceModal: () => void
  onCloseEditServiceModal: () => void
  onCloseAddContractorModal: () => void
  onCloseEditContractorModal: () => void
  onSendEmail: () => void
  onAddService: () => void
  onEditService: () => void
  onAssignContractor: () => void
  onEditContractor: () => void
  onEmailDataChange: (field: string, value: string) => void
  onServiceFormChange: (field: string, value: string | number) => void
  onSelectedContractorChange: (value: string) => void
  onResetTemplate?: () => void
  showPreview?: boolean
  onTogglePreview?: () => void
  availableSkills?: string[]
  selectedSkills?: string[]
  filteredContractors?: Contractor[]
  contractorRateType?: 'hourly' | 'flat'
  contractorHours?: number
  contractorCost?: number
  onToggleSkillFilter?: (skill: string) => void
  onRateTypeChange?: (type: 'hourly' | 'flat') => void
  onHoursChange?: (hours: number) => void
}

export default function QuoteModals({
  showEmailModal,
  showAddServiceModal,
  showEditServiceModal,
  showAddContractorModal,
  showEditContractorModal,
  sendingEmail,
  contractors,
  selectedContractor,
  editingItem,
  serviceForm,
  emailData,
  onCloseEmailModal,
  onCloseAddServiceModal,
  onCloseEditServiceModal,
  onCloseAddContractorModal,
  onCloseEditContractorModal,
  onSendEmail,
  onAddService,
  onEditService,
  onAssignContractor,
  onEditContractor,
  onEmailDataChange,
  onServiceFormChange,
  onSelectedContractorChange,
  onResetTemplate,
  showPreview = false,
  onTogglePreview,
  availableSkills = [],
  selectedSkills = [],
  filteredContractors = [],
  contractorRateType = 'hourly',
  contractorHours = 1,
  contractorCost = 0,
  onToggleSkillFilter,
  onRateTypeChange,
  onHoursChange,
  includeInTotal = true,
  onIncludeInTotalChange
}: QuoteModalsProps) {
  return (
    <>
      {/* Email Modal */}
      {showEmailModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 20px 0' }}>
              Send Quote via Email
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                To:
              </label>
              <input
                type="email"
                value={emailData.to}
                onChange={(e) => onEmailDataChange('to', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Subject:
              </label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => onEmailDataChange('subject', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Message:
              </label>
              {showPreview ? (
                <div style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa',
                  color: '#1f2937',
                  minHeight: '150px',
                  whiteSpace: 'pre-wrap',
                  fontSize: '16px',
                  lineHeight: '1.6'
                }}>
                  {emailData.message}
                </div>
              ) : (
                <textarea
                  value={emailData.message}
                  onChange={(e) => onEmailDataChange('message', e.target.value)}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <div style={{display: 'flex', gap: '10px'}}>
                {onResetTemplate && (
                  <button
                    onClick={onResetTemplate}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'rgba(147, 51, 234, 0.2)',
                      color: '#a78bfa',
                      border: '1px solid rgba(147, 51, 234, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    🔄 Reset to Template
                  </button>
                )}
                {onTogglePreview && (
                  <button
                    onClick={onTogglePreview}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    👁️ {showPreview ? 'Edit' : 'Preview'}
                  </button>
                )}
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                <button
                  onClick={onCloseEmailModal}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={onSendEmail}
                  disabled={sendingEmail}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    opacity: sendingEmail ? 0.5 : 1
                  }}
                >
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 20px 0' }}>
              Add Service
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Service Name:
              </label>
              <input
                type="text"
                value={serviceForm.serviceName}
                onChange={(e) => onServiceFormChange('serviceName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Description:
              </label>
              <textarea
                value={serviceForm.description}
                onChange={(e) => onServiceFormChange('description', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Quantity:
                </label>
                <input
                  type="number"
                  value={serviceForm.quantity}
                  onChange={(e) => onServiceFormChange('quantity', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Unit Price ($):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={serviceForm.unitPrice}
                  onChange={(e) => onServiceFormChange('unitPrice', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={onCloseAddServiceModal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={onAddService}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditServiceModal && editingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 20px 0' }}>
              Edit Service
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Service Name:
              </label>
              <input
                type="text"
                value={serviceForm.serviceName}
                onChange={(e) => onServiceFormChange('serviceName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Description:
              </label>
              <textarea
                value={serviceForm.description}
                onChange={(e) => onServiceFormChange('description', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Quantity:
                </label>
                <input
                  type="number"
                  value={serviceForm.quantity}
                  onChange={(e) => onServiceFormChange('quantity', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Unit Price ($):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={serviceForm.unitPrice}
                  onChange={(e) => onServiceFormChange('unitPrice', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={onCloseEditServiceModal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={onEditService}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Update Service
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
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: '0 0 1rem 0' }}>
              Assign Contractor
            </h3>
            <p style={{ color: '#cbd5e1', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Select skills needed and choose a contractor for this quote
            </p>

            {/* Skills Filter */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>
                Skills Needed:
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {availableSkills.map(skill => (
                  <label
                    key={skill}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      color: '#cbd5e1',
                      fontSize: '0.875rem'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSkills?.includes(skill) || false}
                      onChange={() => onToggleSkillFilter && onToggleSkillFilter(skill)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
              {selectedSkills && selectedSkills.length > 0 && (
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                  Showing contractors with: {selectedSkills.join(', ')}
                </p>
              )}
            </div>

            {/* Contractor Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>
                Available Contractors ({filteredContractors?.length || 0}):
              </label>
              <div style={{
                maxHeight: '220px',
                overflowY: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }}>
                {filteredContractors && filteredContractors.length > 0 ? (
                  filteredContractors.map(contractor => (
                    <label
                      key={contractor.id}
                      style={{
                        display: 'block',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        backgroundColor: selectedContractor === contractor.id ? 'rgba(147, 51, 234, 0.2)' : 'transparent',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedContractor !== contractor.id) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedContractor !== contractor.id) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="radio"
                          name="contractor"
                          value={contractor.id}
                          checked={selectedContractor === contractor.id}
                          onChange={(e) => onSelectedContractorChange(e.target.value)}
                          style={{ cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'white', fontWeight: '500', marginBottom: '0.25rem' }}>
                            {contractor.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            Skills: {contractor.skills.join(', ')}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            ${Number(contractor.hourlyRate || contractor.rate).toFixed(2)}/hr | ${Number(contractor.flatRate || contractor.rate).toFixed(2)} flat
                          </div>
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <p style={{ padding: '1rem', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic', fontSize: '0.875rem' }}>
                    {selectedSkills && selectedSkills.length > 0 
                      ? 'No contractors match selected skills' 
                      : 'Select skills to filter contractors'}
                  </p>
                )}
              </div>
            </div>

            {/* Rate Type and Hours */}
            {selectedContractor && (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>
                    Rate Type:
                  </label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        value="hourly"
                        checked={contractorRateType === 'hourly'}
                        onChange={(e) => onRateTypeChange && onRateTypeChange(e.target.value as 'hourly' | 'flat')}
                        style={{ cursor: 'pointer' }}
                      />
                      Hourly Rate
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        value="flat"
                        checked={contractorRateType === 'flat'}
                        onChange={(e) => onRateTypeChange && onRateTypeChange(e.target.value as 'hourly' | 'flat')}
                        style={{ cursor: 'pointer' }}
                      />
                      Flat Rate
                    </label>
                  </div>
                </div>

                {contractorRateType === 'hourly' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>
                      Hours:
                    </label>
                    <input
                      type="number"
                      value={contractorHours}
                      onChange={(e) => onHoursChange && onHoursChange(Number(e.target.value))}
                      min="0.5"
                      step="0.5"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                )}

                {/* Cost Summary */}
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(147, 51, 234, 0.1)',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  borderRadius: '0.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <p style={{ color: '#e9d5ff', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    Assignment Summary:
                  </p>
                  <p style={{ color: 'white', fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {selectedSkills && selectedSkills.join(', ')} - ${contractorCost.toFixed(2)}
                  </p>
                  <p style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>
                    {contractorRateType === 'hourly' 
                      ? `${contractorHours} hrs @ $${contractorHours > 0 ? (contractorCost / contractorHours).toFixed(2) : '0.00'}/hr`
                      : 'Flat rate'
                    }
                  </p>
                </div>
              </>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={onCloseAddContractorModal}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={onAssignContractor}
                disabled={!selectedContractor || !selectedSkills || selectedSkills.length === 0}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: selectedContractor && selectedSkills && selectedSkills.length > 0 ? '#9333ea' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: selectedContractor && selectedSkills && selectedSkills.length > 0 ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  opacity: selectedContractor && selectedSkills && selectedSkills.length > 0 ? 1 : 0.5
                }}
              >
                Assign Contractor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contractor Modal */}
      {showEditContractorModal && editingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 20px 0' }}>
              Edit Contractor Assignment
            </h3>
            <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>
              Update contractor assignment for this quote
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Select Contractor:
              </label>
              <select
                value={selectedContractor}
                onChange={(e) => onSelectedContractorChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              >
                <option value="">Choose a contractor...</option>
                {contractors.map((contractor) => (
                  <option key={contractor.id} value={contractor.id}>
                    {contractor.name} - {contractor.email}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={onCloseEditContractorModal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={onEditContractor}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Update Contractor
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
