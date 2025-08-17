import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/invoices/[id] - Get a specific invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id
      },
      include: {
        items: {
          include: {
            contractor: true,
            serviceTemplate: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        client: true,
        quote: true,
        payments: true
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Convert Decimal values to numbers for frontend compatibility
    const invoiceWithNumbers = {
      ...invoice,
      subtotal: Number(invoice.subtotal),
      taxAmount: Number(invoice.taxAmount),
      total: Number(invoice.total),
      items: invoice.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      }))
    }

    return NextResponse.json(invoiceWithNumbers)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/invoices/[id] - Update an invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: resolvedParams.id },
      data: {
        title,
        description,
        status,
        dueDate: new Date(dueDate),
        subtotal: parseFloat(subtotal),
        taxRate: parseFloat(taxRate),
        taxAmount: parseFloat(taxAmount),
        total: parseFloat(total),
        notes,
        terms,
        paymentMethod,
        paymentReference,
        clientId,
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        quoteId: quoteId || null
      }
    })

    // Update items if provided
    if (items && Array.isArray(items)) {
      // Delete existing items
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: resolvedParams.id }
      })

      // Create new items
      for (const item of items) {
        await prisma.invoiceItem.create({
          data: {
            invoiceId: resolvedParams.id,
            serviceName: item.serviceName,
            description: item.description,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            total: parseFloat(item.total),
            contractorId: item.contractorId || null,
            serviceTemplateId: item.serviceTemplateId || null,
            sortOrder: item.sortOrder || 0
          }
        })
      }
    }

    // Convert Decimal values to numbers for frontend compatibility
    const updatedInvoiceWithNumbers = {
      ...updatedInvoice,
      subtotal: Number(updatedInvoice.subtotal),
      taxAmount: Number(updatedInvoice.taxAmount),
      total: Number(updatedInvoice.total)
    }

    return NextResponse.json(updatedInvoiceWithNumbers)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/invoices/[id] - Delete an invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    await prisma.invoice.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



