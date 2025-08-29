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

    // Convert Decimal values to numbers for frontend compatibility
    const quoteWithNumbers = {
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

    // Update the quote
    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        title: body.title,
        description: body.description,
        validUntil: body.validUntil,
        terms: body.terms,
        notes: body.notes,

        subtotal: body.subtotal,
        taxRate: body.taxRate,
        taxAmount: body.taxAmount,
        total: body.total
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
    const quoteWithNumbers = {
      ...updatedQuote,
      subtotal: Number(updatedQuote.subtotal),
      taxRate: Number(updatedQuote.taxRate),
      taxAmount: Number(updatedQuote.taxAmount),
      total: Number(updatedQuote.total),

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
