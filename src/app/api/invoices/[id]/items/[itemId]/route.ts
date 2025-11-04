import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
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

    const { id: invoiceId, itemId } = await params
    const body = await request.json()

    const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, userId: user.id } })
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const existingItem = await prisma.invoiceItem.findFirst({ where: { id: itemId, invoiceId } })
    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const updatedItem = await prisma.invoiceItem.update({
      where: { id: itemId },
      data: {
        serviceName: body.serviceName,
        description: body.description,
        quantity: parseFloat(body.quantity) || 0,
        unitPrice: parseFloat(body.unitPrice) || 0,
        total: parseFloat(body.total) || 0,
        taxable: body.taxable !== undefined ? body.taxable : false,
        contractorId: body.contractorId || null,
        serviceTemplateId: body.serviceTemplateId || null
      },
      include: {
        contractor: true,
        serviceTemplate: true
      }
    })

    const allItems = await prisma.invoiceItem.findMany({ where: { invoiceId } })
    const subtotal = allItems.reduce((sum, item) => sum + Number(item.total), 0)
    const taxableAmount = allItems.reduce((sum, item) => sum + (item.taxable ? Number(item.total) : 0), 0)
    const taxAmount = taxableAmount * (Number(invoice.taxRate) / 100)
    const total = subtotal + taxAmount

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { subtotal, taxAmount, total }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating invoice item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
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

    const { id: invoiceId, itemId } = await params

    const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, userId: user.id } })
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const existingItem = await prisma.invoiceItem.findFirst({ where: { id: itemId, invoiceId } })
    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    await prisma.invoiceItem.delete({ where: { id: itemId } })

    const remainingItems = await prisma.invoiceItem.findMany({ where: { invoiceId } })
    const subtotal = remainingItems.reduce((sum, item) => sum + Number(item.total), 0)
    const taxableAmount = remainingItems.reduce((sum, item) => sum + (item.taxable ? Number(item.total) : 0), 0)
    const taxAmount = taxableAmount * (Number(invoice.taxRate) / 100)
    const total = subtotal + taxAmount

    await prisma.invoice.update({ where: { id: invoiceId }, data: { subtotal, taxAmount, total } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


