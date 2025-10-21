'use client'

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
  onTogglePreview
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
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 20px 0' }}>
              Assign Contractor
            </h3>
            <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>
              Assign a contractor to this quote
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
                onClick={onCloseAddContractorModal}
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
                onClick={onAssignContractor}
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
