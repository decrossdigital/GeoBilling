import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { addActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-logger'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { quoteId, paymentOption, clientEmail, clientName } = paymentIntent.metadata

        if (quoteId) {
          // Update quote status to approved
          const quote = await prisma.quote.findUnique({
            where: { id: quoteId }
          })

          if (quote) {
            const updatedActivityLog = addActivityLog(
              quote.activityLog,
              ACTIVITY_ACTIONS.QUOTE_APPROVED,
              clientName || 'Client',
              `Payment: $${(paymentIntent.amount / 100).toFixed(2)} (${paymentOption === 'deposit' ? '50% deposit' : 'full payment'}) via Stripe`
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
            console.log(`Quote ${quote.quoteNumber} approved with payment ${paymentIntent.id}`)
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { quoteId } = paymentIntent.metadata

        if (quoteId) {
          // Log payment failure
          const quote = await prisma.quote.findUnique({
            where: { id: quoteId }
          })

          if (quote) {
            const updatedActivityLog = addActivityLog(
              quote.activityLog,
              'Payment failed',
              'System',
              `Payment attempt failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`
            )

            await prisma.quote.update({
              where: { id: quoteId },
              data: {
                activityLog: updatedActivityLog
              }
            })

            console.log(`Payment failed for quote ${quote.quoteNumber}: ${paymentIntent.last_payment_error?.message}`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
