import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { addActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quoteId, paymentOption, amount, token } = body

    if (!quoteId || !paymentOption || !amount || !token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify quote and token
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        approvalToken: token,
        status: 'sent'
      },
      include: {
        client: true
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
          'Quote expired when attempting to create checkout session'
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

    const paymentAmount = Math.round(Number(amount) * 100) // Convert to cents

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: STRIPE_CONFIG.paymentMethods,
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: `Quote ${quote.quoteNumber} - ${quote.project}`,
              description: paymentOption === 'deposit' 
                ? '50% Deposit Payment' 
                : 'Full Payment',
            },
            unit_amount: paymentAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}&quote_id=${quoteId}`,
      cancel_url: `${STRIPE_CONFIG.cancelUrl}?quote_id=${quoteId}`,
      customer_email: quote.client.email,
      metadata: {
        quoteId,
        paymentOption,
        amount: amount.toString(),
        type: 'quote_approval'
      }
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
