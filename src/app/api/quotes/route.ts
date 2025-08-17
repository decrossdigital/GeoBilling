import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/quotes - Get all quotes for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const quotes = await prisma.quote.findMany({
      where: { userId: user.id },
      include: {
        client: true,
        items: {
          include: {
            contractor: true,
            serviceTemplate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Convert Decimal values to numbers for frontend compatibility
    const quotesWithNumbers = quotes.map(quote => ({
      ...quote,
      subtotal: Number(quote.subtotal),
      taxRate: Number(quote.taxRate),
      taxAmount: Number(quote.taxAmount),
      total: Number(quote.total),
      items: quote.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      }))
    }))

    return NextResponse.json(quotesWithNumbers)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/quotes - Create a new quote
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      status, 
      validUntil, 
      subtotal, 
      taxRate, 
      taxAmount, 
      total, 
      notes, 
      terms,
      clientId,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      items 
    } = body

    if (!title || !clientId) {
      return NextResponse.json({ error: 'Title and client are required' }, { status: 400 })
    }

    // Generate quote number
    const quoteCount = await prisma.quote.count({
      where: { userId: user.id }
    })
    const quoteNumber = `Q-${new Date().getFullYear()}-${String(quoteCount + 1).padStart(3, '0')}`

    // Set default validUntil if not provided (30 days from now)
    const validUntilDate = validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        title,
        description: description || '',
        status: status || 'draft',
        validUntil: validUntilDate,
        subtotal: parseFloat(subtotal) || 0,
        taxRate: parseFloat(taxRate) || 0,
        taxAmount: parseFloat(taxAmount) || 0,
        total: parseFloat(total) || 0,
        notes: notes || '',
        terms: terms || '',
        clientId,
        clientName,
        clientEmail,
        clientPhone: clientPhone || '',
        clientAddress: clientAddress || '',
        userId: user.id,
        userName: user.name || '',
        userEmail: user.email,
        userPhone: user.phone || '',
        userAddress: user.address || ''
      }
    })

    // Create quote items if provided
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await prisma.quoteItem.create({
          data: {
            quoteId: quote.id,
            serviceName: item.serviceName,
            description: item.description || '',
            quantity: parseFloat(item.quantity) || 0,
            unitPrice: parseFloat(item.unitPrice) || 0,
            total: parseFloat(item.total) || 0,
            contractorId: item.contractorId || null,
            serviceTemplateId: item.serviceTemplateId || null,
            sortOrder: item.sortOrder || 0
          }
        })
      }
    }

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
