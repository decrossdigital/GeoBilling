import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-logger'

// GET /api/quotes/[id]/approve - Get quote for approval (with token validation)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const quoteId = resolvedParams.id
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Approval token required' }, { status: 400 })
    }

    // Find quote with matching token
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        approvalToken: token,
        status: 'sent' // Only allow approval of sent quotes
      },
      include: {
        client: true,
        items: {
          include: {
            contractor: true,
            serviceTemplate: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        contractors: {
          include: {
            contractor: true
          }
        }
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found or invalid token' }, { status: 404 })
    }

    // Check if quote has expired
    if (new Date() > new Date(quote.validUntil)) {
      return NextResponse.json({ error: 'Quote has expired' }, { status: 400 })
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
      })),
      contractors: quote.contractors.map(qc => ({
        ...qc,
        cost: Number(qc.cost),
        hours: qc.hours ? Number(qc.hours) : null
      }))
    }

    return NextResponse.json(quoteWithNumbers)
  } catch (error) {
    console.error('Error fetching quote for approval:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/quotes/[id]/approve - Approve quote with payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const quoteId = resolvedParams.id
    const body = await request.json()
    const { token, paymentOption, amount } = body

    if (!token || !paymentOption || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find quote with matching token
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        approvalToken: token,
        status: 'sent'
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found or invalid token' }, { status: 404 })
    }

    // Check if quote has expired
    if (new Date() > new Date(quote.validUntil)) {
      return NextResponse.json({ error: 'Quote has expired' }, { status: 400 })
    }

    // TODO: Process payment with Stripe
    // For now, we'll simulate successful payment
    const paymentDetails = {
      amount: parseFloat(amount),
      paymentOption,
      paymentMethod: 'stripe', // Will be set by Stripe integration
      transactionId: `txn_${Date.now()}` // Temporary transaction ID
    }

    // Update quote status to approved
    const updatedActivityLog = addActivityLog(
      quote.activityLog,
      ACTIVITY_ACTIONS.QUOTE_APPROVED,
      'Client',
      `Payment: $${paymentDetails.amount.toFixed(2)} (${paymentOption === 'deposit' ? '50% deposit' : 'full payment'})`
    )

    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        activityLog: updatedActivityLog
      }
    })

    // TODO: Create invoice from approved quote
    // This will be implemented in the next phase

    return NextResponse.json({
      success: true,
      message: 'Quote approved successfully',
      paymentDetails
    })
  } catch (error) {
    console.error('Error approving quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
