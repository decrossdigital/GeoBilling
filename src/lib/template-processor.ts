// Template processing utility for email templates with merge fields

interface QuoteData {
  quoteNumber: string
  project: string
  projectDescription?: string
  total: number
  validUntil: string
  notes?: string
  terms?: string
  client: {
    firstName?: string
    lastName?: string
    email: string
    phone?: string
    address?: string
    company?: string
  }
  items: Array<{
    serviceName: string
    description?: string
    quantity: number
    unitPrice: number
    total: number
    contractorId?: string
    contractor?: {
      name: string
      specialty?: string
    }
  }>
}

interface CompanySettings {
  name: string
  email: string
  phone: string
  address?: string
}

export function getClientName(client: { firstName?: string; lastName?: string; company?: string }): string {
  if (client.firstName && client.lastName) {
    return `${client.firstName} ${client.lastName}`
  }
  return client.firstName || client.company || 'Valued Client'
}

export function processQuoteTemplate(
  template: string,
  quote: QuoteData,
  companySettings: CompanySettings,
  quoteUrl: string
): string {
  const clientName = getClientName(quote.client)
  
  // Build services section
  const services = quote.items.filter(item => !item.contractorId)
  const servicesSection = services.length > 0
    ? `SERVICES\n${services.map(item => 
        `- ${item.serviceName} (Qty: ${item.quantity}) - $${item.total.toFixed(2)}${item.description ? '\n  ' + item.description : ''}`
      ).join('\n')}`
    : ''

  // Build contractors section
  const contractors = quote.items.filter(item => item.contractorId && item.contractor)
  const contractorsSection = contractors.length > 0
    ? `\nCONTRACTORS\n${contractors.map(item => 
        `- ${item.contractor?.name}${item.contractor?.specialty ? ' - ' + item.contractor.specialty : ''} - $${item.total.toFixed(2)}`
      ).join('\n')}`
    : ''

  // Replace all merge fields
  let processed = template
    // Client fields
    .replace(/\{\{clientName\}\}/g, clientName)
    .replace(/\{\{clientFirstName\}\}/g, quote.client.firstName || '')
    .replace(/\{\{clientLastName\}\}/g, quote.client.lastName || '')
    .replace(/\{\{clientEmail\}\}/g, quote.client.email)
    .replace(/\{\{clientPhone\}\}/g, quote.client.phone || 'Not provided')
    .replace(/\{\{clientAddress\}\}/g, quote.client.address || 'Not provided')
    .replace(/\{\{clientCompany\}\}/g, quote.client.company || '')
    
    // Quote fields
    .replace(/\{\{quoteNumber\}\}/g, quote.quoteNumber)
    .replace(/\{\{project\}\}/g, quote.project)
    .replace(/\{\{projectDescription\}\}/g, quote.projectDescription || '')
    .replace(/\{\{total\}\}/g, quote.total.toFixed(2))
    .replace(/\{\{validUntil\}\}/g, new Date(quote.validUntil).toLocaleDateString())
    .replace(/\{\{notes\}\}/g, quote.notes || 'No additional notes')
    .replace(/\{\{terms\}\}/g, quote.terms || 'Standard terms apply')
    
    // Generated sections
    .replace(/\{\{servicesSection\}\}/g, servicesSection)
    .replace(/\{\{contractorsSection\}\}/g, contractorsSection)
    
    // System fields
    .replace(/\{\{quoteUrl\}\}/g, quoteUrl)
    
    // Company fields
    .replace(/\{\{companyName\}\}/g, companySettings.name)
    .replace(/\{\{companyEmail\}\}/g, companySettings.email)
    .replace(/\{\{companyPhone\}\}/g, companySettings.phone)
    .replace(/\{\{companyAddress\}\}/g, companySettings.address || '')

  return processed
}

