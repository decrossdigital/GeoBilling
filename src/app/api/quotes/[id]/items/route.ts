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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id: quoteId } = await params
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

    // Create new quote item
    const newItem = await prisma.quoteItem.create({
      data: {
        quoteId: quoteId,
        serviceName: body.serviceName,
        description: body.description,
        quantity: parseFloat(body.quantity) || 0,
        unitPrice: parseFloat(body.unitPrice) || 0,
        total: parseFloat(body.total) || 0,
        contractorId: body.contractorId || null,
        serviceTemplateId: body.serviceTemplateId || null,
        sortOrder: body.sortOrder || 0
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
    const taxAmount = subtotal * (Number(quote.taxRate) / 100)
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

    return NextResponse.json(newItem)

  } catch (error) {
    console.error('Error creating quote item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
