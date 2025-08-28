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
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get invoices for this client
    const invoices = await prisma.invoice.findMany({
      where: {
        clientId: id,
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Combine and format job history
    const jobHistory = [
      ...quotes.map(quote => ({
        id: quote.id,
        type: 'quote' as const,
        title: `Quote #${quote.quoteNumber || quote.id.slice(-8)}`,
        amount: Number(quote.total),
        status: quote.status,
        date: quote.createdAt,
        reference: quote.quoteNumber || `QTE-${quote.id.slice(-8)}`
      })),
      ...invoices.map(invoice => ({
        id: invoice.id,
        type: 'invoice' as const,
        title: `Invoice #${invoice.invoiceNumber || invoice.id.slice(-8)}`,
        amount: Number(invoice.total),
        status: invoice.status,
        date: invoice.createdAt,
        reference: invoice.invoiceNumber || `INV-${invoice.id.slice(-8)}`
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(jobHistory)

  } catch (error) {
    console.error('Error fetching client history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
