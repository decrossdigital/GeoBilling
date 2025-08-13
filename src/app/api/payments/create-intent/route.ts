import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createPaymentIntent } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { amount, currency = 'usd', invoiceId, description } = body

    if (!amount || !invoiceId) {
      return NextResponse.json({ error: 'Amount and invoice ID are required' }, { status: 400 })
    }

    // Verify the invoice belongs to the user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: user.id
      },
      include: {
        client: true
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found or access denied' }, { status: 404 })
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(
      parseFloat(amount),
      currency,
      {
        invoiceId,
        userId: user.id,
        description: description || `Payment for ${invoice.title}`,
        clientName: invoice.client?.name || 'Unknown Client'
      }
    )

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
