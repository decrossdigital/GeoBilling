import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id: invoiceId } = await params
    const body = await request.json()

    // Verify invoice exists and belongs to current user
    const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, userId: user.id } })
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Create invoice item
    const newItem = await prisma.invoiceItem.create({
      data: {
        invoiceId,
        serviceName: body.serviceName,
        description: body.description,
        quantity: parseFloat(body.quantity) || 0,
        unitPrice: parseFloat(body.unitPrice) || 0,
        total: parseFloat(body.total) || 0,
        taxable: body.taxable !== undefined ? body.taxable : false,
        contractorId: body.contractorId || null,
        serviceTemplateId: body.serviceTemplateId || null,
        sortOrder: body.sortOrder || 0
      },
      include: {
        contractor: true,
        serviceTemplate: true
      }
    })

    // Recalculate invoice totals
    const allItems = await prisma.invoiceItem.findMany({ where: { invoiceId } })
    const subtotal = allItems.reduce((sum, item) => sum + Number(item.total), 0)
    const taxableAmount = allItems.reduce((sum, item) => sum + (item.taxable ? Number(item.total) : 0), 0)
    const taxAmount = taxableAmount * (Number(invoice.taxRate) / 100)
    const total = subtotal + taxAmount

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotal,
        taxAmount,
        total
      }
    })

    return NextResponse.json(newItem)
  } catch (error) {
    console.error('Error creating invoice item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


