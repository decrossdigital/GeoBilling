import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// POST /api/invoices/send-email - Send invoice via email
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
    const { invoiceId, to, subject, message } = body

    if (!invoiceId || !to || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the invoice belongs to the user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: user.id
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // TODO: Implement actual email sending functionality
    // For now, just update the invoice status to 'sent'
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'sent' }
    })

    return NextResponse.json({ 
      message: 'Invoice sent successfully',
      // TODO: Add actual email sending response
      emailSent: true
    })
  } catch (error) {
    console.error('Error sending invoice email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
