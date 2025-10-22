import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const invoiceId = resolvedParams.id
    const body = await request.json()
    const { amount } = body

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 })
    }

    // Verify invoice exists and belongs to user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: (await prisma.user.findUnique({
          where: { email: session.user.email }
        }))?.id
      },
      include: {
        client: true
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 })
    }

    const paymentAmount = Math.round(Number(amount) * 100) // Convert to cents

    // Create Stripe Checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: STRIPE_CONFIG.paymentMethods,
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: `Invoice ${invoice.invoiceNumber} - ${invoice.project}`,
              description: 'Invoice Payment',
            },
            unit_amount: paymentAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoiceId}`,
      cancel_url: `${STRIPE_CONFIG.cancelUrl}?invoice_id=${invoiceId}`,
      customer_email: invoice.client.email,
      metadata: {
        invoiceId,
        amount: amount.toString(),
        type: 'invoice_payment'
      }
    })

    return NextResponse.json({ sessionId: stripeSession.id })
  } catch (error) {
    console.error('Error creating invoice payment session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
