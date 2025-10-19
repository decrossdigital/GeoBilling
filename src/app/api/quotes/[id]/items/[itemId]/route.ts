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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id: quoteId, itemId } = await params
    const body = await request.json()

    // Verify the quote exists and belongs to the user
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId: user.id
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Verify the item exists and belongs to the quote
    const existingItem = await prisma.quoteItem.findFirst({
      where: {
        id: itemId,
        quoteId: quoteId
      }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Update the item
    const updatedItem = await prisma.quoteItem.update({
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

    // Recalculate quote totals
    const allItems = await prisma.quoteItem.findMany({
      where: { quoteId: quoteId }
    })

    const subtotal = allItems.reduce((sum, item) => sum + Number(item.total), 0)
    const taxableAmount = allItems.reduce((sum, item) => sum + (item.taxable ? Number(item.total) : 0), 0)
    const taxAmount = taxableAmount * (Number(quote.taxRate) / 100)
    const total = subtotal + taxAmount

    // Update quote totals
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        subtotal: subtotal,
        taxAmount: taxAmount,
        total: total
      }
    })

    return NextResponse.json(updatedItem)

  } catch (error) {
    console.error('Error updating quote item:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id: quoteId, itemId } = await params

    // Verify the quote exists and belongs to the user
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId: user.id
      }
    })

    if (!existingQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Verify the item exists and belongs to the quote
    const existingItem = await prisma.quoteItem.findFirst({
      where: {
        id: itemId,
        quoteId: quoteId
      }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Delete the item
    await prisma.quoteItem.delete({
      where: { id: itemId }
    })

    // Recalculate quote totals
    const remainingItems = await prisma.quoteItem.findMany({
      where: { quoteId: quoteId }
    })

    const subtotal = remainingItems.reduce((sum, item) => sum + Number(item.total), 0)
    const taxableAmount = remainingItems.reduce((sum, item) => sum + (item.taxable ? Number(item.total) : 0), 0)
    const taxAmount = taxableAmount * (Number(existingQuote.taxRate) / 100)
    const total = subtotal + taxAmount

    // Update quote totals
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        subtotal: subtotal,
        taxAmount: taxAmount,
        total: total
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting quote item:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
