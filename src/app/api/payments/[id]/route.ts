import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/payments/[id] - Get a specific payment
export async function GET(
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

    const { id } = await params

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        invoice: {
          userId: user.id
        }
      },
      include: {
        invoice: {
          include: {
            client: true
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/payments/[id] - Update payment status
export async function PUT(
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

    const { id } = await params
    const body = await request.json()
    const { status, paymentReference } = body

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        invoice: {
          userId: user.id
        }
      }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: status || payment.status,
        paymentReference: paymentReference || payment.paymentReference,
        processedAt: status === 'completed' ? new Date() : null
      },
      include: {
        invoice: {
          include: {
            client: true
          }
        }
      }
    })

    // Update invoice status if payment is completed
    if (status === 'completed') {
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { 
          status: 'paid',
          paidDate: new Date()
        }
      })
    }

    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
