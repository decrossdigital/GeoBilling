import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/invoices - Get all invoices for the current user
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

    const invoices = await prisma.invoice.findMany({
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

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/invoices - Create a new invoice
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
      dueDate, 
      subtotal, 
      taxRate, 
      taxAmount, 
      total, 
      notes, 
      terms,
      paymentMethod,
      paymentReference,
      clientId,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      quoteId,
      items 
    } = body

    if (!title || !clientId || !dueDate) {
      return NextResponse.json({ error: 'Title, client, and due date are required' }, { status: 400 })
    }

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { userId: user.id }
    })
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(3, '0')}`

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        title,
        description: description || '',
        status: status || 'draft',
        dueDate: new Date(dueDate),
        subtotal: parseFloat(subtotal) || 0,
        taxRate: parseFloat(taxRate) || 0,
        taxAmount: parseFloat(taxAmount) || 0,
        total: parseFloat(total) || 0,
        notes: notes || '',
        terms: terms || '',
        paymentMethod: paymentMethod || '',
        paymentReference: paymentReference || '',
        clientId,
        clientName,
        clientEmail,
        clientPhone: clientPhone || '',
        clientAddress: clientAddress || '',
        quoteId: quoteId || null,
        userId: user.id,
        userName: user.name || '',
        userEmail: user.email,
        userPhone: user.phone || '',
        userAddress: user.address || ''
      }
    })

    // Create invoice items if provided
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
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

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
