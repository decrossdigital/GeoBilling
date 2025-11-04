import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendContractorFeeEmail } from '@/lib/email'
import { addActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-logger'
import crypto from 'crypto'

// POST /api/invoices/[id]/contractors/[contractorId]/bill-separately - Initiate separate billing for contractor
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contractorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: invoiceId, contractorId } = await params

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify the invoice belongs to the user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: user.id
      },
      include: {
        client: true,
        contractors: {
          where: { id: contractorId },
          include: {
            contractor: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const invoiceContractor = invoice.contractors[0]
    if (!invoiceContractor) {
      return NextResponse.json({ error: 'Contractor assignment not found' }, { status: 404 })
    }

    // Check if already billed separately
    if (invoiceContractor.billedSeparately) {
      return NextResponse.json({ error: 'Contractor fee has already been billed separately' }, { status: 400 })
    }

    // Check if contractor is included in total
    if (!invoiceContractor.includeInTotal) {
      return NextResponse.json({ error: 'Contractor is not included in total. Cannot bill separately.' }, { status: 400 })
    }

    // Generate unique payment token
    const paymentToken = crypto.randomBytes(32).toString('hex')

    // Update contractor assignment
    const updated = await prisma.invoiceContractor.update({
      where: { id: contractorId },
      data: {
        billedSeparately: true,
        billedSeparatelyAt: new Date(),
        contractorFeePaymentToken: paymentToken
      },
      include: {
        contractor: true
      }
    })

    // Add activity log entry
    const updatedActivityLog = addActivityLog(
      invoice.activityLog || '',
      ACTIVITY_ACTIONS.CONTRACTOR_BILLING_REQUESTED,
      'Admin',
      `Contractor fee billed separately: ${updated.contractor.name} - $${Number(updated.cost).toFixed(2)}`
    )

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        activityLog: updatedActivityLog
      }
    })

    // Construct payment URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const paymentUrl = `${baseUrl}/invoices/${invoiceId}/contractors/${contractorId}/pay?token=${paymentToken}`

    // Send email to client
    const clientName = invoice.client.firstName && invoice.client.lastName
      ? `${invoice.client.firstName} ${invoice.client.lastName}`
      : invoice.client.company || invoice.client.email

    try {
      await sendContractorFeeEmail(
        invoice.client.email,
        clientName,
        invoice.invoiceNumber,
        updated.contractor.name,
        updated.assignedSkills,
        updated.notes || '',
        Number(updated.cost),
        paymentUrl
      )
    } catch (emailError) {
      console.error('Failed to send contractor fee email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Contractor fee billing request sent',
      paymentToken
    })
  } catch (error) {
    console.error('Error billing contractor separately:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

