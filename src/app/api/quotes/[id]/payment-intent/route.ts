import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { addActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-logger'

// POST /api/quotes/[id]/payment-intent - Create payment intent for quote approval
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const quoteId = resolvedParams.id
    const body = await request.json()
    const { token, paymentOption, amount, clientEmail, clientName } = body

    if (!token || !paymentOption || !amount || !clientEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find quote with matching token
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        approvalToken: token,
        status: 'sent'
      },
      include: {
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

    // Check if quote has expired and update status if needed
    if (new Date() > new Date(quote.validUntil)) {
      // If quote hasn't been marked as expired yet, mark it now
      if (quote.status !== 'expired') {
        const updatedActivityLog = addActivityLog(
          quote.activityLog,
          ACTIVITY_ACTIONS.QUOTE_EXPIRED,
          'System',
          'Quote expired when attempting to create payment intent'
        )
        
        await prisma.quote.update({
          where: { id: quoteId },
          data: {
            status: 'expired',
            activityLog: updatedActivityLog
          }
        })
      }
      return NextResponse.json({ error: 'Quote has expired' }, { status: 400 })
    }

    // Calculate contractor costs
    const contractorCostsTotal = quote.contractors
      .filter(c => c.includeInTotal)
      .reduce((sum, c) => sum + Number(c.cost), 0)
    
    const grandTotal = Number(quote.total) + contractorCostsTotal
    const paymentAmount = paymentOption === 'deposit' ? grandTotal * 0.5 : grandTotal

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(paymentAmount, 'usd'),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        quoteId: quote.id,
        quoteNumber: quote.quoteNumber,
        paymentOption,
        clientEmail,
        clientName: clientName || 'Client'
      },
      description: `Payment for Quote ${quote.quoteNumber} - ${paymentOption === 'deposit' ? '50% Deposit' : 'Full Payment'}`
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentAmount
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
