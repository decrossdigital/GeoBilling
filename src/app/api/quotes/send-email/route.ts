import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quoteId, to, subject, message } = await request.json()

    if (!quoteId || !to || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the quote exists and belongs to the user
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId: session.user.id
      },
      include: {
        client: true
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // TODO: Implement actual email sending functionality
    // For now, we'll just update the quote status to 'sent'
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'sent' }
    })

    // Log the email details (in production, you'd send an actual email)
    console.log('Email would be sent:', {
      to,
      subject,
      message,
      quoteId
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Quote sent successfully' 
    })

  } catch (error) {
    console.error('Error sending quote email:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
