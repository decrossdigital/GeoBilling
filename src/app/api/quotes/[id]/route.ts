import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getClientName } from '@/lib/template-processor'
import { addActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: quoteId } = await params

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId: user.id
      },
      include: {
        client: true,
        items: {
          include: {
            serviceTemplate: true,
            contractor: true
          }
        }
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Check if quote has expired and update status if needed (only for sent quotes)
    if (quote.status === 'sent' && new Date() > new Date(quote.validUntil)) {
      const updatedActivityLog = addActivityLog(
        quote.activityLog,
        ACTIVITY_ACTIONS.QUOTE_EXPIRED,
        'System',
        'Quote expired automatically'
      )
      
      await prisma.quote.update({
        where: { id: quoteId },
        data: {
          status: 'expired',
          activityLog: updatedActivityLog
        }
      })
      
      // Refetch the quote to get updated status
      const updatedQuote = await prisma.quote.findFirst({
        where: { id: quoteId },
        include: {
          client: true,
          items: {
            include: {
              serviceTemplate: true,
              contractor: true
            }
          }
        }
      })
      
      if (updatedQuote) {
        // Use updated quote for the rest of the processing
        Object.assign(quote, updatedQuote)
      }
    }

    // Recalculate totals based on current items to fix any calculation errors
    const itemsWithNumbers = quote.items.map(item => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.total)
    }))

    // Recalculate subtotal from items
    const recalculatedSubtotal = itemsWithNumbers.reduce((sum, item) => sum + item.total, 0)
    const taxRate = Number(quote.taxRate)
    const taxableAmount = itemsWithNumbers.reduce((sum, item) => sum + (item.taxable ? item.total : 0), 0)
    const recalculatedTaxAmount = taxableAmount * (taxRate / 100)
    const recalculatedTotal = recalculatedSubtotal + recalculatedTaxAmount

    // Convert Decimal values to numbers for frontend compatibility
    // Compute client name from firstName/lastName
    const clientWithName = quote.client ? {
      ...quote.client,
      name: getClientName(quote.client)
    } : quote.client

    const quoteWithNumbers = {
      ...quote,
      client: clientWithName,
      subtotal: recalculatedSubtotal,
      taxRate: taxRate,
      taxAmount: recalculatedTaxAmount,
      total: recalculatedTotal,
      items: itemsWithNumbers
    }

    return NextResponse.json(quoteWithNumbers)

  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: quoteId } = await params
    const body = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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

    // Get current items to recalculate totals
    const currentQuote = await prisma.quote.findFirst({
      where: { id: quoteId },
      include: { items: true }
    })

    if (!currentQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Recalculate totals based on current items
    const recalculatedSubtotal = currentQuote.items.reduce((sum, item) => sum + Number(item.total), 0)
    const taxRate = Number(currentQuote.taxRate)
    const taxableAmount = currentQuote.items.reduce((sum, item) => sum + (item.taxable ? Number(item.total) : 0), 0)
    const recalculatedTaxAmount = taxableAmount * (taxRate / 100)
    const recalculatedTotal = recalculatedSubtotal + recalculatedTaxAmount

    // Update the quote with recalculated totals
    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        title: body.title,
        description: body.description,
        project: body.project,
        projectDescription: body.projectDescription,
        validUntil: body.validUntil,
        terms: body.terms,
        notes: body.notes,
        status: body.status,
        subtotal: recalculatedSubtotal,
        taxAmount: recalculatedTaxAmount,
        total: recalculatedTotal
      },
      include: {
        client: true,
        items: {
          include: {
            serviceTemplate: true,
            contractor: true
          }
        }
      }
    })

    // Convert Decimal values to numbers for frontend compatibility
    // Compute client name from firstName/lastName
    const clientWithName = updatedQuote.client ? {
      ...updatedQuote.client,
      name: getClientName(updatedQuote.client)
    } : updatedQuote.client

    const quoteWithNumbers = {
      ...updatedQuote,
      client: clientWithName,
      subtotal: recalculatedSubtotal,
      taxRate: taxRate,
      taxAmount: recalculatedTaxAmount,
      total: recalculatedTotal,
      items: updatedQuote.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      }))
    }

    return NextResponse.json(quoteWithNumbers)

  } catch (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: quoteId } = await params

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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

    // Delete the quote (this will cascade delete related items)
    await prisma.quote.delete({
      where: { id: quoteId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
