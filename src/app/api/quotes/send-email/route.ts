import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendQuoteEmail } from '@/lib/email'

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

    // Get user details for the from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Send the actual email using Resend
    try {
      await sendQuoteEmail(
        to,
        quote.clientName,
        quote.quoteNumber,
        Number(quote.total),
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/quotes/${quoteId}`
      )

      // Update quote status to 'sent'
      await prisma.quote.update({
        where: { id: quoteId },
        data: { status: 'sent' }
      })

      console.log('Quote email sent successfully:', {
        to,
        quoteId,
        quoteNumber: quote.quoteNumber
      })
    } catch (emailError) {
      console.error('Failed to send quote email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send email. Please try again.' },
        { status: 500 }
      )
    }

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
