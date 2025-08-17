'use client'

import { User, Mail, Phone, Calendar } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface QuoteDetailsProps {
  quote: {
    id: string
    quoteNumber: string
    title: string
    status: string
    subtotal: number
    taxRate: number
    taxAmount: number
    total: number
    validUntil: string
    depositAmount: number
    createdAt: string
    client: Client
  }
}

export default function QuoteDetails({ quote }: QuoteDetailsProps) {
  return (
    <div>
      {/* Client Information */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>Client Information</h2>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem'}}>
          <User style={{height: '1rem', width: '1rem', color: '#cbd5e1'}} />
          <span style={{color: 'white', fontWeight: '500'}}>{quote.client.name}</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem'}}>
          <Mail style={{height: '1rem', width: '1rem', color: '#cbd5e1'}} />
          <span style={{color: '#cbd5e1'}}>{quote.client.email}</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem'}}>
          <Phone style={{height: '1rem', width: '1rem', color: '#cbd5e1'}} />
          <span style={{color: '#cbd5e1'}}>{quote.client.phone}</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <Calendar style={{height: '1rem', width: '1rem', color: '#cbd5e1'}} />
          <span style={{color: '#cbd5e1'}}>{quote.client.address}</span>
        </div>
      </div>

      {/* Quote Details */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>Quote Details</h2>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
          <div>
            <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Created</p>
            <p style={{fontSize: '1rem', color: 'white', fontWeight: '500'}}>{new Date(quote.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Valid Until</p>
            <p style={{fontSize: '1rem', color: 'white', fontWeight: '500'}}>{new Date(quote.validUntil).toLocaleDateString()}</p>
          </div>
          <div>
            <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Subtotal</p>
            <p style={{fontSize: '1rem', color: 'white', fontWeight: '500'}}>${quote.subtotal.toFixed(2)}</p>
          </div>
          <div>
            <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Tax ({quote.taxRate}%)</p>
            <p style={{fontSize: '1rem', color: 'white', fontWeight: '500'}}>${quote.taxAmount.toFixed(2)}</p>
          </div>
          <div>
            <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Deposit Required</p>
            <p style={{fontSize: '1rem', color: 'white', fontWeight: '500'}}>${(quote.depositAmount || 0).toFixed(2)}</p>
          </div>
          <div>
            <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Total</p>
            <p style={{fontSize: '1.25rem', color: 'white', fontWeight: 'bold'}}>${quote.total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
