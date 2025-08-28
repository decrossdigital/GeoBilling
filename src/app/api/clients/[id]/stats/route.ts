import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get quotes for this client
    const quotes = await prisma.quote.findMany({
      where: {
        clientId: id,
        userId: user.id
      },
      include: {
        items: true
      }
    })

    // Get invoices for this client
    const invoices = await prisma.invoice.findMany({
      where: {
        clientId: id,
        userId: user.id
      },
      include: {
        items: true
      }
    })

    // Calculate statistics
    const totalQuotes = quotes.length
    const totalInvoices = invoices.length
    
    const totalRevenue = invoices.reduce((sum, invoice) => {
      return sum + Number(invoice.total)
    }, 0)

    const averageQuoteValue = totalQuotes > 0 
      ? quotes.reduce((sum, quote) => sum + Number(quote.total), 0) / totalQuotes 
      : 0

    const averageInvoiceValue = totalInvoices > 0 
      ? totalRevenue / totalInvoices 
      : 0

    // Calculate conversion rate (quotes that became invoices)
    const quoteIds = quotes.map(q => q.id)
    const convertedQuotes = invoices.filter(invoice => 
      invoice.quoteId && quoteIds.includes(invoice.quoteId)
    ).length
    const conversionRate = totalQuotes > 0 ? Math.round((convertedQuotes / totalQuotes) * 100) : 0

    // Get last activity date
    const allActivities = [
      ...quotes.map(q => ({ date: q.createdAt, type: 'quote' })),
      ...invoices.map(i => ({ date: i.createdAt, type: 'invoice' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const lastActivity = allActivities.length > 0 ? allActivities[0].date : client.createdAt

    return NextResponse.json({
      totalQuotes,
      totalInvoices,
      totalRevenue: Number(totalRevenue),
      averageQuoteValue: Number(averageQuoteValue),
      averageInvoiceValue: Number(averageInvoiceValue),
      lastActivity,
      conversionRate
    })

  } catch (error) {
    console.error('Error fetching client stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
