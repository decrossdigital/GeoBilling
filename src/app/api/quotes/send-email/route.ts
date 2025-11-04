import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendQuoteEmail } from '@/lib/email'
import { addActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quoteId, to, subject, message, approvalToken, validUntil, isResend } = await request.json()

    if (!quoteId || !to || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

          const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Verify the quote exists and belongs to the user
      const quote = await prisma.quote.findFirst({
        where: {
          id: quoteId,
          userId: user.id
        },
      include: {
        client: true
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }



    // Send the actual email using Resend with custom subject and message
    try {
      const { sendEmail } = await import('@/lib/email')
      
      // Debug: Check if approval URL is in the message
      if (message.includes('approve?token=')) {
        console.log('✓ Approval URL with token found in message')
      } else if (message.includes('/quote/') && !message.includes('approve')) {
        console.warn('⚠ URL found but missing /approve?token= path')
      } else if (message.includes('/quote/')) {
        console.warn('⚠ Quote URL found but token might be missing')
      }
      
      // Convert plain text URLs to HTML links and newlines to breaks
      let htmlMessage = message
        // Convert URLs to HTML links (must be before newline conversion)
        // This ensures query parameters are preserved in the href attribute
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" style="color: #667eea; text-decoration: underline;">$1</a>')
        // Convert newlines to HTML breaks
        .replace(/\n/g, '<br>')
      
      await sendEmail({
        to,
        subject,
        html: htmlMessage
      })

      // Use provided approval token or generate one
      const finalApprovalToken = approvalToken || `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      
      // Handle resend logic
      let updateData: any = {
        status: 'sent', // Update status to 'sent' (especially if it was expired)
        approvalToken: finalApprovalToken
      }
      
      // If validUntil is provided (for resend), update it
      if (validUntil) {
        updateData.validUntil = new Date(validUntil)
      }
      
      // Add appropriate activity log entry
      let activityAction = ACTIVITY_ACTIONS.QUOTE_SENT
      if (isResend) {
        activityAction = ACTIVITY_ACTIONS.QUOTE_RESENT
        const validUntilInfo = validUntil ? ` - Valid until: ${new Date(validUntil).toLocaleDateString()}` : ''
        const updatedActivityLog = addActivityLog(quote.activityLog, activityAction, user.name || user.email, validUntilInfo)
        updateData.activityLog = updatedActivityLog
      } else {
        const updatedActivityLog = addActivityLog(quote.activityLog, activityAction, user.name || user.email)
        updateData.activityLog = updatedActivityLog
      }
      
      await prisma.quote.update({
        where: { id: quoteId },
        data: updateData
      })

      console.log('Quote email sent successfully:', {
        to,
        quoteId,
        quoteNumber: quote.quoteNumber
      })
    } catch (emailError: any) {
      console.error('Failed to send quote email:', emailError)
      
      // Check if it's a Resend validation error (email restriction)
      if (emailError?.statusCode === 403 && emailError?.name === 'validation_error') {
        return NextResponse.json(
          { 
            error: 'Email sending restricted. In testing mode, you can only send to george@uniquitousmusic.com. To send to other addresses, verify a domain at resend.com/domains.',
            details: emailError.message 
          },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to send email. Please try again.',
          details: emailError?.message || 'Unknown error'
        },
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
