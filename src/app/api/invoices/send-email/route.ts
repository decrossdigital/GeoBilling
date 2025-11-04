import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendEmail, sendInvoiceEmail } from '@/lib/email'
import { addActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-logger'

// POST /api/invoices/send-email - Send invoice via email
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

    const body = await request.json()
    const { invoiceId, to, subject, message, isResend, useStandardTemplate } = body

    // For resend, we only need invoiceId
    if (isResend) {
      if (!invoiceId) {
        return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
      }
    } else {
      // For regular send, we need invoiceId at minimum
      // If useStandardTemplate is true, we don't need to/subject/message
      if (!invoiceId) {
        return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
      }
      if (!useStandardTemplate && (!to || !subject || !message)) {
        return NextResponse.json({ error: 'Missing required fields (to, subject, message) or set useStandardTemplate to true' }, { status: 400 })
      }
    }

    // Verify the invoice belongs to the user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: user.id
      },
      include: {
        client: true,
        payments: {
          where: {
            status: 'completed'
          },
          orderBy: {
            processedAt: 'desc'
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Send the actual email
    try {
      // Helper function to send standard invoice email
      const sendStandardInvoiceEmail = async () => {
        const clientName = invoice.client.firstName && invoice.client.lastName
          ? `${invoice.client.firstName} ${invoice.client.lastName}`
          : invoice.client.company || invoice.client.email || 'Valued Client'
        
        const invoiceUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invoices/${invoiceId}`
        const termsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/terms`
        
        // Calculate grand total (including contractor costs)
        const contractorCosts = await prisma.invoiceContractor.findMany({
          where: {
            invoiceId: invoiceId,
            includeInTotal: true
          }
        })
        const contractorCostsTotal = contractorCosts.reduce((sum, c) => sum + Number(c.cost), 0)
        const grandTotal = Number(invoice.total) + contractorCostsTotal
        
        // Format payments for email template
        const paymentsForEmail = invoice.payments.map(p => ({
          amount: Number(p.amount),
          paymentMethod: p.paymentMethod,
          paymentReference: p.paymentReference,
          transactionId: p.transactionId,
          processedAt: p.processedAt?.toISOString() || null,
          createdAt: p.createdAt.toISOString()
        }))
        
        await sendInvoiceEmail(
          invoice.client.email,
          clientName,
          invoice.invoiceNumber,
          grandTotal,
          invoice.dueDate.toISOString(),
          invoiceUrl,
          invoice.terms || undefined,
          termsUrl,
          paymentsForEmail.length > 0 ? paymentsForEmail : undefined
        )
      }

      if (isResend || useStandardTemplate) {
        // For resend or when using standard template, use the standard invoice email template
        await sendStandardInvoiceEmail()
        
        // Add activity log entry
        const activityAction = isResend ? ACTIVITY_ACTIONS.INVOICE_RESENT : ACTIVITY_ACTIONS.INVOICE_SENT
        const activityMessage = isResend ? 'Invoice resent via email' : 'Invoice sent to client'
        const updatedActivityLog = addActivityLog(
          invoice.activityLog || '',
          activityAction,
          'Admin',
          activityMessage
        )
        
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { 
            activityLog: updatedActivityLog,
            // Update status to 'sent' if not already (only for first send, not resend)
            ...(isResend ? {} : { status: 'sent' })
          }
        })
      } else {
        // For regular send with custom subject and message
        await sendEmail({
          to,
          subject,
          html: message.replace(/\n/g, '<br>')  // Convert newlines to HTML breaks
        })

        // Update invoice status to 'sent' if not already
        if (invoice.status !== 'sent') {
          const updatedActivityLog = addActivityLog(
            invoice.activityLog || '',
            ACTIVITY_ACTIONS.INVOICE_SENT,
            'Admin',
            'Invoice sent to client'
          )
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: { 
              status: 'sent',
              activityLog: updatedActivityLog
            }
          })
        }
      }

      console.log('Invoice email sent successfully:', {
        to: invoice.client.email,
        invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        isResend
      })

      return NextResponse.json({ 
        message: isResend ? 'Invoice resent successfully' : 'Invoice sent successfully',
        emailSent: true
      })
    } catch (emailError: any) {
      console.error('Failed to send invoice email:', emailError)
      
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
        { error: 'Failed to send email', details: emailError.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending invoice email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
