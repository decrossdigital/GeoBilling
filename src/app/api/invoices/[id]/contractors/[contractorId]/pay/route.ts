import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-logger'
import { sendEmail } from '@/lib/email'

// GET /api/invoices/[id]/contractors/[contractorId]/pay - Get contractor fee payment details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contractorId: string }> }
) {
  try {
    const { id: invoiceId, contractorId } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Payment token required' }, { status: 400 })
    }

    // Find invoice contractor with matching token
    const invoiceContractor = await prisma.invoiceContractor.findFirst({
      where: {
        id: contractorId,
        invoiceId: invoiceId,
        contractorFeePaymentToken: token,
        billedSeparately: true
      },
      include: {
        contractor: true,
        invoice: true
      }
    })

    if (!invoiceContractor) {
      return NextResponse.json({ error: 'Contractor fee payment not found or invalid token' }, { status: 404 })
    }

    // Check if already paid
    if (!invoiceContractor.includeInTotal) {
      return NextResponse.json({ error: 'Contractor fee has already been paid' }, { status: 400 })
    }

    return NextResponse.json({
      contractorName: invoiceContractor.contractor.name,
      contractorSkills: invoiceContractor.assignedSkills,
      contractorNotes: invoiceContractor.notes || '',
      amount: Number(invoiceContractor.cost),
      invoiceNumber: invoiceContractor.invoice.invoiceNumber
    })
  } catch (error) {
    console.error('Error fetching contractor payment data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/invoices/[id]/contractors/[contractorId]/pay - Process contractor fee payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contractorId: string }> }
) {
  try {
    const { id: invoiceId, contractorId } = await params
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Payment token required' }, { status: 400 })
    }

    // Find invoice contractor with matching token
    const invoiceContractor = await prisma.invoiceContractor.findFirst({
      where: {
        id: contractorId,
        invoiceId: invoiceId,
        contractorFeePaymentToken: token,
        billedSeparately: true
      },
      include: {
        contractor: true,
        invoice: {
          include: {
            client: true,
            user: true
          }
        }
      }
    })

    if (!invoiceContractor) {
      return NextResponse.json({ error: 'Contractor fee payment not found or invalid token' }, { status: 404 })
    }

    // Check if already paid (check if contractor is no longer included in total)
    if (!invoiceContractor.includeInTotal) {
      return NextResponse.json({ error: 'Contractor fee has already been paid' }, { status: 400 })
    }

    // TODO: Process payment with Stripe
    // For now, we'll simulate successful payment
    const paymentDetails = {
      amount: Number(invoiceContractor.cost),
      paymentMethod: 'stripe', // Will be set by Stripe integration
      transactionId: `txn_contractor_${Date.now()}` // Temporary transaction ID
    }

    // Create Payment record
    await prisma.payment.create({
      data: {
        invoiceId: invoiceId,
        amount: paymentDetails.amount,
        currency: 'USD',
        paymentMethod: paymentDetails.paymentMethod,
        paymentReference: `Contractor Fee - ${invoiceContractor.contractor.name} (Invoice Contractor ID: ${contractorId})`,
        status: 'completed',
        transactionId: paymentDetails.transactionId,
        processedAt: new Date()
      }
    })

    // Update contractor to exclude from total
    await prisma.invoiceContractor.update({
      where: { id: contractorId },
      data: {
        includeInTotal: false
      }
    })

    // Add activity log entry
    const updatedActivityLog = addActivityLog(
      invoiceContractor.invoice.activityLog || '',
      ACTIVITY_ACTIONS.CONTRACTOR_FUNDED,
      'Client',
      `Contractor fee paid separately: ${invoiceContractor.contractor.name} - $${paymentDetails.amount.toFixed(2)}`
    )

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        activityLog: updatedActivityLog
      }
    })

    // Send email notifications
    try {
      const invoice = invoiceContractor.invoice
      const clientName = invoice.client.firstName && invoice.client.lastName
        ? `${invoice.client.firstName} ${invoice.client.lastName}`
        : invoice.client.company || invoice.client.email || 'Valued Client'

      // Email to client - confirmation
      const clientEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Uniquitous Music</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Music Production Services</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Contractor Fee Payment Confirmed</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Dear ${clientName},
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This email confirms that your payment for contractor fees has been successfully processed.
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Payment Details</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Contractor:</strong> ${invoiceContractor.contractor.name}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Amount Paid:</strong> $${paymentDetails.amount.toFixed(2)}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your payment. If you have any questions, please contact us at george@uniquitousmusic.com or call (609) 316-8080.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
              <p>Uniquitous Music<br>
              george@uniquitousmusic.com<br>
              (609) 316-8080</p>
            </div>
          </div>
        </div>
      `

      await sendEmail({
        to: invoice.client.email,
        subject: `Contractor Fee Payment Confirmed - Invoice ${invoice.invoiceNumber}`,
        html: clientEmailHtml
      })

      // Email to admin - notification
      if (invoice.user.email) {
        const adminEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Uniquitous Music</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Music Production Services</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Contractor Fee Payment Received</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                A contractor fee payment has been received for the following invoice.
              </p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 10px 0; color: #333;">Payment Details</h3>
                <p style="margin: 5px 0; color: #666;"><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Client:</strong> ${clientName} (${invoice.client.email})</p>
                <p style="margin: 5px 0; color: #666;"><strong>Contractor:</strong> ${invoiceContractor.contractor.name}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Amount Paid:</strong> $${paymentDetails.amount.toFixed(2)}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
                <p>Uniquitous Music Billing System</p>
              </div>
            </div>
          </div>
        `

        await sendEmail({
          to: invoice.user.email,
          subject: `Contractor Fee Payment Received - Invoice ${invoice.invoiceNumber}`,
          html: adminEmailHtml
        })
      }
    } catch (emailError) {
      console.error('Error sending contractor payment notification emails:', emailError)
      // Don't fail the payment if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Contractor fee paid successfully',
      paymentDetails
    })
  } catch (error) {
    console.error('Error processing contractor fee payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

