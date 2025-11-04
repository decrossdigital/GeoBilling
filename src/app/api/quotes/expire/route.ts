import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-logger'

// POST /api/quotes/expire - Check and expire quotes that have passed their validUntil date
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

    // Find all sent quotes that have expired (validUntil < now) but are not yet marked as expired
    const now = new Date()
    const expiredQuotes = await prisma.quote.findMany({
      where: {
        userId: user.id,
        status: 'sent', // Only expire sent quotes, not drafts
        validUntil: {
          lt: now // validUntil is less than current date
        }
      }
    })

    // Update each expired quote
    let expiredCount = 0
    for (const quote of expiredQuotes) {
      const updatedActivityLog = addActivityLog(
        quote.activityLog,
        ACTIVITY_ACTIONS.QUOTE_EXPIRED,
        'System',
        `Quote expired on ${now.toLocaleDateString()}`
      )

      await prisma.quote.update({
        where: { id: quote.id },
        data: {
          status: 'expired',
          activityLog: updatedActivityLog
        }
      })

      expiredCount++
    }

    return NextResponse.json({ 
      success: true,
      expiredCount,
      message: expiredCount > 0 
        ? `Expired ${expiredCount} quote${expiredCount > 1 ? 's' : ''}` 
        : 'No quotes to expire'
    })
  } catch (error) {
    console.error('Error expiring quotes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

