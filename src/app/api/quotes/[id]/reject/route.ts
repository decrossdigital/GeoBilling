import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-logger'

// POST /api/quotes/[id]/reject - Reject quote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const quoteId = resolvedParams.id
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Approval token required' }, { status: 400 })
    }

    // Find quote with matching token
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        approvalToken: token,
        status: 'sent'
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found or invalid token' }, { status: 404 })
    }

    // Update quote status to rejected
    const updatedActivityLog = addActivityLog(
      quote.activityLog,
      ACTIVITY_ACTIONS.QUOTE_REJECTED,
      'Client'
    )

    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'rejected',
        activityLog: updatedActivityLog
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Quote rejected successfully'
    })
  } catch (error) {
    console.error('Error rejecting quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
