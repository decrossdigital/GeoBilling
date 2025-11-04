import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendBulkContractorFeeEmail } from '@/lib/email'
import { addActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-logger'
import crypto from 'crypto'

// POST /api/invoices/[id]/contractors/bulk-bill-separately - Initiate bulk separate billing for multiple contractors
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: invoiceId } = await params
    const body = await request.json()
    const { contractorIds } = body

    if (!contractorIds || !Array.isArray(contractorIds) || contractorIds.length === 0) {
      return NextResponse.json({ error: 'Contractor IDs array is required' }, { status: 400 })
    }

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
          where: { id: { in: contractorIds } },
          include: {
            contractor: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status !== 'draft') {
      return NextResponse.json({ error: 'Bulk billing is only available for draft invoices' }, { status: 400 })
    }

    // Filter eligible contractors (only those that match the requested IDs and are eligible)
    const eligibleContractors = invoice.contractors.filter(
      ic => contractorIds.includes(ic.id) && ic.includeInTotal && !ic.billedSeparately
    )

    if (eligibleContractors.length === 0) {
      return NextResponse.json({ error: 'No eligible contractors found for bulk billing' }, { status: 400 })
    }

    if (eligibleContractors.length !== contractorIds.length) {
      // Some requested contractors were not eligible
      console.warn(`Some contractors were not eligible: requested ${contractorIds.length}, eligible ${eligibleContractors.length}`)
    }

    // Generate a unique payment token for the bulk payment
    const bulkBillingGroupId = `bulk_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`
    const paymentToken = `bulk_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const paymentUrl = `${baseUrl}/invoices/${invoiceId}/contractors/bulk-pay?token=${paymentToken}`

    // Update all eligible contractors
    const updatedContractors = []
    let totalAmount = 0

    for (const ic of eligibleContractors) {
      const updated = await prisma.invoiceContractor.update({
        where: { id: ic.id },
        data: {
          billedSeparately: true,
          billedSeparatelyAt: new Date(),
          contractorFeePaymentToken: paymentToken // All contractors share the same token for bulk payment
        },
        include: {
          contractor: true
        }
      })
      updatedContractors.push(updated)
      totalAmount += Number(updated.cost)
    }

    // Add activity log entry
    const contractorNames = updatedContractors.map(ic => ic.contractor.name).join(', ')
    const updatedActivityLog = addActivityLog(
      invoice.activityLog || '',
      ACTIVITY_ACTIONS.CONTRACTOR_BILLING_REQUESTED,
      'Admin',
      `Bulk contractor fee billing request sent for ${updatedContractors.length} contractor(s): ${contractorNames} - Total: $${totalAmount.toFixed(2)}`
    )

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        activityLog: updatedActivityLog
      }
    })

    // Send email to client
    const clientName = invoice.client.firstName && invoice.client.lastName
      ? `${invoice.client.firstName} ${invoice.client.lastName}`
      : invoice.client.company || invoice.client.email

    try {
      await sendBulkContractorFeeEmail(
        invoice.client.email,
        clientName,
        invoice.invoiceNumber,
        updatedContractors.map(ic => ({
          name: ic.contractor.name,
          skills: ic.assignedSkills,
          notes: ic.notes || '',
          amount: Number(ic.cost)
        })),
        totalAmount,
        paymentUrl,
        bulkBillingGroupId
      )
    } catch (emailError) {
      console.error('Failed to send bulk contractor fee email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Bulk billing request sent for ${updatedContractors.length} contractor(s)`,
      paymentToken,
      bulkBillingGroupId,
      contractorCount: updatedContractors.length,
      totalAmount
    })
  } catch (error) {
    console.error('Error sending bulk contractor billing request:', error)
    return NextResponse.json(
      { error: 'Failed to send bulk contractor billing request' },
      { status: 500 }
    )
  }
}

