import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/payments - Get all payments for the current user
export async function GET() {
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

    const payments = await prisma.payment.findMany({
      where: {
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/payments - Create a new payment record
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
    const { 
      invoiceId, 
      amount, 
      paymentMethod, 
      paymentReference, 
      status, 
      notes 
    } = body

    if (!invoiceId || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Invoice ID, amount, and payment method are required' }, { status: 400 })
    }

    // Verify the invoice belongs to the user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: user.id
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found or access denied' }, { status: 404 })
    }

    // Generate payment number
    const paymentCount = await prisma.payment.count({
      where: {
        invoice: {
          userId: user.id
        }
      }
    })
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(paymentCount + 1).padStart(3, '0')}`

    const payment = await prisma.payment.create({
      data: {
        paymentNumber,
        invoiceId,
        amount: parseFloat(amount),
        paymentMethod,
        paymentReference: paymentReference || '',
        status: status || 'pending',
        transactionId: paymentReference || null
      },
      include: {
        invoice: {
          include: {
            client: true
          }
        }
      }
    })

    // Update invoice status if payment is successful
    if (status === 'completed') {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { 
          status: 'paid',
          paidDate: new Date()
        }
      })
    }

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
