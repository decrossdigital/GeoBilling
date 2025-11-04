import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-logger'
import { sendEmail } from '@/lib/email'

// GET /api/quotes/[id]/approve - Get quote for approval (with token validation)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const quoteId = resolvedParams.id
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Approval token required' }, { status: 400 })
    }

    // Find quote with matching token
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        approvalToken: token,
        status: 'sent' // Only allow approval of sent quotes
      },
      include: {
        client: true,
        items: {
          include: {
            contractor: true,
            serviceTemplate: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        contractors: {
          include: {
            contractor: true
          }
        }
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found or invalid token' }, { status: 404 })
    }

    // Check if quote has expired and update status if needed
    if (new Date() > new Date(quote.validUntil)) {
      // If quote hasn't been marked as expired yet, mark it now
      if (quote.status !== 'expired') {
        const updatedActivityLog = addActivityLog(
          quote.activityLog,
          ACTIVITY_ACTIONS.QUOTE_EXPIRED,
          'System',
          'Quote expired when attempting to view'
        )
        
        await prisma.quote.update({
          where: { id: quoteId },
          data: {
            status: 'expired',
            activityLog: updatedActivityLog
          }
        })
      }
      return NextResponse.json({ error: 'Quote has expired' }, { status: 400 })
    }

    // Convert Decimal values to numbers for frontend compatibility
    const quoteWithNumbers = {
      ...quote,
      subtotal: Number(quote.subtotal),
      taxRate: Number(quote.taxRate),
      taxAmount: Number(quote.taxAmount),
      total: Number(quote.total),
      items: quote.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      })),
      contractors: quote.contractors.map(qc => ({
        ...qc,
        cost: Number(qc.cost),
        hours: qc.hours ? Number(qc.hours) : null
      }))
    }

    return NextResponse.json(quoteWithNumbers)
  } catch (error) {
    console.error('Error fetching quote for approval:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/quotes/[id]/approve - Approve quote with payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const quoteId = resolvedParams.id
    const body = await request.json()
    const { token, paymentOption, amount, termsAgreed } = body

    if (!token || !paymentOption || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!termsAgreed) {
      return NextResponse.json({ error: 'Terms & Conditions must be agreed to' }, { status: 400 })
    }

    // Find quote with matching token
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        approvalToken: token,
        status: 'sent'
      },
      include: {
        client: true,
        user: true,
        items: {
          include: {
            contractor: true,
            serviceTemplate: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        contractors: {
          include: {
            contractor: true
          }
        }
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found or invalid token' }, { status: 404 })
    }

    // Check if quote has expired and update status if needed
    if (new Date() > new Date(quote.validUntil)) {
      // If quote hasn't been marked as expired yet, mark it now
      if (quote.status !== 'expired') {
        const updatedActivityLog = addActivityLog(
          quote.activityLog,
          ACTIVITY_ACTIONS.QUOTE_EXPIRED,
          'System',
          'Quote expired when attempting to approve'
        )
        
        await prisma.quote.update({
          where: { id: quoteId },
          data: {
            status: 'expired',
            activityLog: updatedActivityLog
          }
        })
      }
      return NextResponse.json({ error: 'Quote has expired' }, { status: 400 })
    }

    // TODO: Process payment with Stripe
    // For now, we'll simulate successful payment
    const paymentDetails = {
      amount: parseFloat(amount),
      paymentOption,
      paymentMethod: 'stripe', // Will be set by Stripe integration
      transactionId: `txn_${Date.now()}` // Temporary transaction ID
    }

    // Add terms agreement to activity log
    let activityLogWithTerms = addActivityLog(
      quote.activityLog,
      ACTIVITY_ACTIONS.TERMS_AGREED,
      'Client',
      'Terms & Conditions agreed to before approval'
    )

    // Update quote status to approved
    const updatedActivityLog = addActivityLog(
      activityLogWithTerms,
      ACTIVITY_ACTIONS.QUOTE_APPROVED,
      'Client',
      `Payment: $${paymentDetails.amount.toFixed(2)} (${paymentOption === 'deposit' ? '50% deposit' : 'full payment'})`
    )

    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        activityLog: updatedActivityLog
      }
    })

    // Create invoice from approved quote
    const invoiceCount = await prisma.invoice.count({
      where: { userId: quote.userId }
    })
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(3, '0')}`

    // Calculate contractor costs total
    const contractorCostsTotal = quote.contractors
      .filter(c => c.includeInTotal)
      .reduce((sum, c) => sum + Number(c.cost), 0)
    const grandTotal = Number(quote.total) + contractorCostsTotal

    // Calculate due date (30 days from now)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    // Create invoice with quote's activity log prepended
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        project: quote.project,
        projectDescription: quote.projectDescription || '',
        status: 'draft', // Invoice starts as draft, ready to be sent at project close
        dueDate,
        subtotal: quote.subtotal,
        taxRate: quote.taxRate,
        taxAmount: quote.taxAmount,
        total: grandTotal,
        notes: quote.notes || '',
        terms: quote.terms || '',
        paymentMethod: '',
        paymentReference: '',
        clientId: quote.clientId,
        clientName: quote.client.firstName && quote.client.lastName
          ? `${quote.client.firstName} ${quote.client.lastName}`
          : quote.client.company || '',
        clientEmail: quote.client.email,
        clientPhone: quote.client.phone || '',
        clientAddress: quote.client.address || '',
        quoteId: quote.id,
        userId: quote.userId,
        userName: quote.user.name || quote.user.email,
        userEmail: quote.user.email,
        userPhone: null,
        userAddress: null,
        activityLog: quote.activityLog, // Prepend quote's activity log
        items: {
          create: quote.items.map(item => ({
            serviceName: item.serviceName,
            description: item.description || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            contractorId: item.contractorId,
            serviceTemplateId: item.serviceTemplateId,
            sortOrder: item.sortOrder
          }))
        },
        contractors: {
          create: quote.contractors.map(qc => ({
            contractorId: qc.contractorId,
            assignedSkills: qc.assignedSkills,
            rateType: qc.rateType,
            hours: qc.hours,
            cost: qc.cost,
            includeInTotal: qc.includeInTotal,
            notes: qc.notes || null
          }))
        }
      }
    })

    // Add invoice created activity log entry
    const invoiceActivityLog = addActivityLog(
      invoice.activityLog,
      ACTIVITY_ACTIONS.INVOICE_CREATED,
      'System',
      'Created from approved quote'
    )

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        activityLog: invoiceActivityLog
      }
    })

    // Create Payment record for the deposit/full payment
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: paymentDetails.amount,
        currency: 'USD',
        paymentMethod: paymentDetails.paymentMethod,
        paymentReference: paymentOption === 'deposit' ? 'Deposit from quote approval' : 'Full payment from quote approval',
        status: 'completed',
        transactionId: paymentDetails.transactionId,
        processedAt: new Date()
      }
    })

    // Send confirmation email to client
    const clientName = quote.client.firstName && quote.client.lastName
      ? `${quote.client.firstName} ${quote.client.lastName}`
      : quote.client.company || quote.client.email

    try {
      await sendEmail({
        to: quote.client.email,
        subject: `Thank You for Approving Quote #${quote.quoteNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Thank You for Approving Your Quote!</h2>
            <p>Dear ${clientName},</p>
            <p>Thank you for approving quote #${quote.quoteNumber} for "${quote.project}". We're excited to work with you on this project.</p>
            <p><strong>Payment Details:</strong></p>
            <ul>
              <li>Payment Type: ${paymentOption === 'deposit' ? '50% Deposit' : 'Full Payment'}</li>
              <li>Amount: $${amount.toFixed(2)}</li>
            </ul>
            <p>We'll be in touch shortly to get started. If you have any questions in the meantime, please don't hesitate to reach out.</p>
            <p>Best regards,<br />Uniquitous Music</p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send client confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    // Send approval notification to admin
    const adminEmail = quote.user.email
    if (adminEmail) {
      try {
        await sendEmail({
          to: adminEmail,
          subject: `Quote #${quote.quoteNumber} Approved`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Quote Approved</h2>
              <p><strong>Quote:</strong> #${quote.quoteNumber} - ${quote.project}</p>
              <p><strong>Client:</strong> ${clientName} (${quote.client.email})</p>
              <p><strong>Payment Type:</strong> ${paymentOption === 'deposit' ? '50% Deposit' : 'Full Payment'}</p>
              <p><strong>Payment Amount:</strong> $${amount.toFixed(2)}</p>
              <p><strong>Total Quote Amount:</strong> $${grandTotal.toFixed(2)}</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
              <p>A draft invoice has been created and is ready to be sent at project close.</p>
              <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/quotes/${quoteId}" style="color: #667eea;">View Quote</a> | <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invoices/${invoice.id}" style="color: #667eea;">View Invoice</a></p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Quote approved successfully',
      paymentDetails,
      invoiceId: invoice.id
    })
  } catch (error) {
    console.error('Error approving quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
