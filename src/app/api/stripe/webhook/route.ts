import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { addActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-logger'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const { quoteId, paymentOption, amount, type } = session.metadata || {}
    
    if (type === 'quote_approval' && quoteId) {
      // Update quote status to approved
      const quote = await prisma.quote.findUnique({
        where: { id: quoteId }
      })

      if (quote) {
        const updatedActivityLog = addActivityLog(
          quote.activityLog,
          ACTIVITY_ACTIONS.QUOTE_APPROVED,
          'Client',
          `Payment: $${amount} (${paymentOption === 'deposit' ? '50% deposit' : 'full payment'}) - Stripe Session: ${session.id}`
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
        console.log(`Quote ${quoteId} approved with payment of $${amount}`)
      }
    } else if (type === 'invoice_payment' && quoteId) {
      // Handle invoice payment
      const invoice = await prisma.invoice.findUnique({
        where: { id: quoteId }
      })

      if (invoice) {
        const updatedActivityLog = addActivityLog(
          invoice.activityLog,
          ACTIVITY_ACTIONS.PAYMENT_RECEIVED,
          'Client',
          `Payment: $${amount} - Stripe Session: ${session.id}`
        )

        await prisma.invoice.update({
          where: { id: quoteId },
          data: {
            status: 'paid',
            paidDate: new Date(),
            activityLog: updatedActivityLog
          }
        })

        console.log(`Invoice ${quoteId} paid with amount $${amount}`)
      }
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id)
  // Additional payment success logic can be added here
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id)
  // Additional payment failure logic can be added here
}
