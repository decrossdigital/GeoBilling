import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-logger'
import { sendEmail } from '@/lib/email'

// POST /api/quotes/[id]/feedback - Submit feedback for quote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const quoteId = resolvedParams.id
    const body = await request.json()
    const { token, feedbackQuestions, feedbackDetails } = body

    if (!token) {
      return NextResponse.json({ error: 'Approval token required' }, { status: 400 })
    }

    // Find quote with matching token
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        approvalToken: token
      },
      include: {
        client: true,
        user: true
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found or invalid token' }, { status: 404 })
    }

    // Build feedback summary
    const selectedReasons: string[] = []
    if (feedbackQuestions.missingItems) {
      selectedReasons.push('Something missing from the quote')
    }
    if (feedbackQuestions.beyondBudget) {
      selectedReasons.push('Beyond budget')
    }
    if (feedbackQuestions.notReadyYet) {
      selectedReasons.push('Not quite ready yet')
    }

    const feedbackSummary = selectedReasons.length > 0
      ? `Selected reasons: ${selectedReasons.join(', ')}`
      : 'No specific reasons selected'

    // Update quote activity log
    const updatedActivityLog = addActivityLog(
      quote.activityLog,
      ACTIVITY_ACTIONS.QUOTE_REJECTED,
      'Client',
      `Feedback submitted: ${feedbackSummary}${feedbackDetails ? `\n\nAdditional comments: ${feedbackDetails}` : ''}`
    )

    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'rejected',
        activityLog: updatedActivityLog
      }
    })

    // Send confirmation email to client
    const clientName = quote.client.firstName && quote.client.lastName
      ? `${quote.client.firstName} ${quote.client.lastName}`
      : quote.client.company || quote.client.email

    try {
      await sendEmail({
        to: quote.client.email,
        subject: `Thank You for Your Feedback - Quote #${quote.quoteNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Thank You for Your Feedback</h2>
            <p>Dear ${clientName},</p>
            <p>Thank you for taking the time to share your thoughts about quote #${quote.quoteNumber}. Your feedback is valuable to us and helps us improve our service.</p>
            <p>We've received your feedback and will review it carefully. We'll be in touch soon to discuss how we can better meet your needs.</p>
            <p>Best regards,<br />Uniquitous Music</p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send client confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    // Send feedback notification to admin
    const adminEmail = quote.user.email
    if (adminEmail) {
      try {
        const feedbackEmailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">New Quote Feedback Received</h2>
            <p><strong>Quote:</strong> #${quote.quoteNumber} - ${quote.project}</p>
            <p><strong>Client:</strong> ${clientName} (${quote.client.email})</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
            <h3 style="color: #333;">Feedback Details:</h3>
            ${selectedReasons.length > 0 ? `
              <p><strong>Selected Reasons:</strong></p>
              <ul>
                ${selectedReasons.map(reason => `<li>${reason}</li>`).join('')}
              </ul>
            ` : '<p><em>No specific reasons selected</em></p>'}
            ${feedbackDetails ? `
              <p><strong>Additional Comments:</strong></p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${feedbackDetails}</div>
            ` : ''}
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
            <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/quotes/${quoteId}" style="color: #667eea;">View Quote Details</a></p>
          </div>
        `

        await sendEmail({
          to: adminEmail,
          subject: `Feedback Received for Quote #${quote.quoteNumber}`,
          html: feedbackEmailBody
        })
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

