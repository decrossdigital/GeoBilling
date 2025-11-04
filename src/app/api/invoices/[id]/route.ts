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
      taxRate: Number(invoice.taxRate),
      taxAmount: Number(invoice.taxAmount),
      total: Number(invoice.total),
      items: invoice.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      })),
      payments: invoice.payments.map(payment => ({
        ...payment,
        amount: Number(payment.amount)
      }))
    }

    return NextResponse.json(invoiceWithNumbers)
  } catch (error: any) {
    console.error('Error fetching invoice:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      fullError: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        meta: error.meta,
        name: error.name
      } : undefined
    }, { status: 500 })
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
      project, 
      projectDescription, 
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

    // Update invoice - only update fields that are provided
    const updateData: any = {}
    if (project !== undefined) updateData.project = project
    if (projectDescription !== undefined) updateData.projectDescription = projectDescription
    if (status !== undefined) updateData.status = status
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate)
    if (subtotal !== undefined) updateData.subtotal = parseFloat(subtotal)
    if (taxRate !== undefined) updateData.taxRate = parseFloat(taxRate)
    if (taxAmount !== undefined) updateData.taxAmount = parseFloat(taxAmount)
    if (total !== undefined) updateData.total = parseFloat(total)
    if (notes !== undefined) updateData.notes = notes
    if (terms !== undefined) updateData.terms = terms
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod
    if (paymentReference !== undefined) updateData.paymentReference = paymentReference
    if (clientId !== undefined) updateData.clientId = clientId
    if (clientName !== undefined) updateData.clientName = clientName
    if (clientEmail !== undefined) updateData.clientEmail = clientEmail
    if (clientPhone !== undefined) updateData.clientPhone = clientPhone
    if (clientAddress !== undefined) updateData.clientAddress = clientAddress
    if (quoteId !== undefined) updateData.quoteId = quoteId || null

    const updatedInvoice = await prisma.invoice.update({
      where: { id: resolvedParams.id },
      data: updateData,
      include: {
        client: true,
        items: true
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
      taxRate: Number(updatedInvoice.taxRate),
      taxAmount: Number(updatedInvoice.taxAmount),
      total: Number(updatedInvoice.total),
      items: updatedInvoice.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      }))
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



