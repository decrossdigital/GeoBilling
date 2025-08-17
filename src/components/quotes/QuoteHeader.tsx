'use client'

import { Send, DollarSign, FileText } from 'lucide-react'

interface QuoteHeaderProps {
  quote: {
    id: string
    quoteNumber: string
    title: string
    status: string
    total: number
  }
  onSendEmail: () => void
  onConvertToInvoice: () => void
  converting: boolean
}

export default function QuoteHeader({ 
  quote, 
  onSendEmail, 
  onConvertToInvoice, 
  converting 
}: QuoteHeaderProps) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '0.75rem',
      padding: '2rem',
      marginBottom: '2rem'
    }}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
        <div>
          <h1 style={{fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0}}>{quote.title}</h1>
          <p style={{fontSize: '1.125rem', color: '#cbd5e1', margin: 0}}>Quote #{quote.quoteNumber}</p>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '0.25rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            backgroundColor: quote.status === 'draft' ? 'rgba(148, 163, 184, 0.2)' : 
                            quote.status === 'sent' ? 'rgba(59, 130, 246, 0.2)' :
                            quote.status === 'converted' ? 'rgba(52, 211, 153, 0.2)' :
                            'rgba(245, 158, 11, 0.2)',
            color: quote.status === 'draft' ? '#94a3b8' : 
                   quote.status === 'sent' ? '#3b82f6' :
                   quote.status === 'converted' ? '#34d399' :
                   '#f59e0b'
          }}>
            {quote.status}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
        <button
          onClick={onSendEmail}
          disabled={quote.status === 'converted'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            opacity: quote.status === 'converted' ? 0.5 : 1
          }}
        >
          <Send style={{height: '1rem', width: '1rem'}} />
          Send via Email
        </button>
        <button
          onClick={onConvertToInvoice}
          disabled={quote.status === 'converted' || converting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            opacity: (quote.status === 'converted' || converting) ? 0.5 : 1
          }}
        >
          <DollarSign style={{height: '1rem', width: '1rem'}} />
          {converting ? 'Converting...' : 'Convert to Invoice'}
        </button>
      </div>
    </div>
  )
}
