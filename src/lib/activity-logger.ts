// Activity logging utility for quotes and invoices

interface ActivityLogEntry {
  action: string
  timestamp: string
  user?: string
  details?: string
}

export function formatActivityLog(activityLog: string | null): ActivityLogEntry[] {
  if (!activityLog) return []
  
  const entries = activityLog.split('\n').filter(line => line.trim())
  return entries.map(entry => {
    // Parse format: "Action on [timestamp] by [user] - [details]"
    const match = entry.match(/^(.+?)\s+on\s+(.+?)(?:\s+by\s+(.+?))?(?:\s+-\s+(.+))?$/)
    if (match) {
      return {
        action: match[1],
        timestamp: match[2],
        user: match[3],
        details: match[4]
      }
    }
    return {
      action: entry,
      timestamp: new Date().toLocaleString(),
      user: undefined,
      details: undefined
    }
  })
}

export function addActivityLog(
  currentLog: string | null,
  action: string,
  user?: string,
  details?: string
): string {
  const timestamp = new Date().toLocaleString()
  const userInfo = user ? ` by ${user}` : ''
  const detailInfo = details ? ` - ${details}` : ''
  const newEntry = `${action} on ${timestamp}${userInfo}${detailInfo}`
  
  if (!currentLog) {
    return newEntry
  }
  
  return `${currentLog}\n${newEntry}`
}

// Common activity log actions
export const ACTIVITY_ACTIONS = {
  QUOTE_CREATED: 'Quote created',
  QUOTE_SENT: 'Quote sent for approval',
  QUOTE_APPROVED: 'Quote approved by client',
  QUOTE_REJECTED: 'Quote rejected by client',
  QUOTE_EXPIRED: 'Quote expired',
  QUOTE_EDITED: 'Quote edited and resent',
  QUOTE_RESENT: 'Quote resent',
  TERMS_AGREED: 'Terms & Conditions agreed to',
  
  INVOICE_CREATED: 'Invoice created',
  INVOICE_SENT: 'Invoice sent to client',
  INVOICE_EDITED: 'Invoice edited',
  INVOICE_RESENT: 'Invoice resent',
  PAYMENT_RECEIVED: 'Payment received',
  CONTRACTOR_BILLING_REQUESTED: 'Contractor billing requested',
  CONTRACTOR_FUNDED: 'Contractor funded',
  INVOICE_OVERDUE: 'Invoice marked as overdue',
  INVOICE_CANCELLED: 'Invoice cancelled'
} as const
