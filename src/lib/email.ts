import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
}

export const sendEmail = async (emailData: EmailData) => {
  try {
    const { data, error } = await resend.emails.send({
      from: emailData.from || 'GeoBilling <noreply@billing.uniquitousmusic.com>',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    })

    if (error) {
      console.error('Email sending error:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Email service error:', error)
    throw error
  }
}

export const sendQuoteEmail = async (
  clientEmail: string,
  clientName: string,
  quoteNumber: string,
  amount: number,
  quoteUrl: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Uniquitous Music</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Music Production Services</p>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #333; margin-bottom: 20px;">New Quote Available</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Dear ${clientName},
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          We're excited to share your new quote for professional music production services. 
          Please review the details below and let us know if you have any questions.
        </p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Quote Details</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Quote Number:</strong> ${quoteNumber}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Total Amount:</strong> $${amount.toLocaleString()}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Valid Until:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${quoteUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            View Quote
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          If you have any questions about this quote or would like to discuss the project further, 
          please don't hesitate to reach out to us at george@uniquitousmusic.com or call (609) 316-8080.
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          Thank you for choosing Uniquitous Music for your music production needs!
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
          <p>Uniquitous Music<br>
          george@uniquitousmusic.com<br>
          (609) 316-8080</p>
        </div>
      </div>
    </div>
  `

  return sendEmail({
    to: clientEmail,
    subject: `New Quote ${quoteNumber} - Uniquitous Music`,
    html,
  })
}

export const sendInvoiceEmail = async (
  clientEmail: string,
  clientName: string,
  invoiceNumber: string,
  amount: number,
  dueDate: string,
  invoiceUrl: string,
  terms?: string,
  termsUrl?: string,
  payments?: Array<{
    amount: number
    paymentMethod: string
    paymentReference: string | null
    transactionId: string | null
    processedAt: string | null
    createdAt: string
  }>
) => {
  // Calculate payment totals
  const paymentsTotal = payments 
    ? payments.reduce((sum, p) => sum + Number(p.amount), 0)
    : 0
  const balanceDue = amount - paymentsTotal
  
  // Build payment history HTML
  const paymentHistoryHtml = payments && payments.length > 0 ? `
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
      <h3 style="margin: 0 0 15px 0; color: #333;">Payment History</h3>
      ${payments.map(payment => `
        <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <div>
              <span style="color: #10b981; margin-right: 8px;">✓</span>
              <strong style="color: #333;">${payment.paymentMethod === 'stripe' ? 'Stripe' : 
                                            payment.paymentMethod === 'paypal' ? 'PayPal' : 
                                            payment.paymentMethod === 'check' ? 'Check' : 
                                            payment.paymentMethod === 'cash' ? 'Cash' : 
                                            payment.paymentMethod}</strong>
              ${payment.paymentReference ? `<span style="color: #666; font-size: 14px; margin-left: 8px;">- ${payment.paymentReference}</span>` : ''}
            </div>
            <strong style="color: #10b981;">$${Number(payment.amount).toLocaleString()}</strong>
          </div>
          <div style="color: #666; font-size: 12px;">
            ${payment.processedAt 
              ? new Date(payment.processedAt).toLocaleDateString()
              : new Date(payment.createdAt).toLocaleDateString()}
            ${payment.transactionId ? ` • ${payment.transactionId}` : ''}
          </div>
        </div>
      `).join('')}
      <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #eee; display: flex; justify-content: space-between;">
        <div>
          <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Total Paid:</strong></p>
          <p style="margin: 0; color: #10b981; font-size: 18px; font-weight: bold;">$${paymentsTotal.toLocaleString()}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Balance Due:</strong></p>
          <p style="margin: 0; color: ${balanceDue > 0 ? '#dc3545' : '#10b981'}; font-size: 18px; font-weight: bold;">$${balanceDue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  ` : ''
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Uniquitous Music</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Music Production Services</p>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #333; margin-bottom: 20px;">Invoice Ready for Payment</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Dear ${clientName},
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Your invoice is ready for payment. Please review the details below and complete your payment 
          by the due date to avoid any late fees.
        </p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Invoice Details</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Invoice Total:</strong> $${amount.toLocaleString()}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
        </div>
        
        ${paymentHistoryHtml}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invoiceUrl}" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            ${balanceDue > 0 ? `Pay Balance Due ($${balanceDue.toLocaleString()})` : 'View Invoice'}
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          ${balanceDue > 0 
            ? 'Payment can be made securely online using the button above. We accept all major credit cards and bank transfers. If you have any questions about this invoice, please contact us at george@uniquitousmusic.com or call (609) 316-8080.'
            : 'This invoice has been paid in full. Thank you for your payment! If you have any questions, please contact us at george@uniquitousmusic.com or call (609) 316-8080.'
          }
        </p>
        
        ${terms ? `
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Terms & Conditions</h3>
          <div style="color: #666; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">${terms}</div>
          ${termsUrl ? `<p style="margin-top: 10px; margin-bottom: 0;"><a href="${termsUrl}" style="color: #667eea; text-decoration: underline;">View complete Terms & Conditions</a></p>` : ''}
        </div>
        ` : `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>Payment Terms:</strong> Payment is due within 30 days of invoice date. 
            Late payments may incur additional fees.
          </p>
        </div>
        `}
        
        <p style="color: #666; line-height: 1.6;">
          Thank you for your business!
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
          <p>Uniquitous Music<br>
          george@uniquitousmusic.com<br>
          (609) 316-8080</p>
        </div>
      </div>
    </div>
  `

  return sendEmail({
    to: clientEmail,
    subject: `Invoice ${invoiceNumber} - Payment Due - Uniquitous Music`,
    html,
  })
}

export const sendPaymentConfirmationEmail = async (
  clientEmail: string,
  clientName: string,
  invoiceNumber: string,
  amount: number,
  paymentId: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Uniquitous Music</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Music Production Services</p>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #333; margin-bottom: 20px;">Payment Confirmed!</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Dear ${clientName},
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Thank you! Your payment has been successfully processed. We've received your payment 
          and your invoice has been marked as paid.
        </p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Payment Details</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Amount Paid:</strong> $${amount.toLocaleString()}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Payment ID:</strong> ${paymentId}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #155724; font-size: 14px;">
            <strong>✓ Payment Status:</strong> Confirmed and processed successfully
          </p>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          We appreciate your business and look forward to working with you on your music production project. 
          If you have any questions about your payment or project, please don't hesitate to contact us.
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          Thank you for choosing Uniquitous Music!
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
          <p>Uniquitous Music<br>
          george@uniquitousmusic.com<br>
          (609) 316-8080</p>
        </div>
      </div>
    </div>
  `

  return sendEmail({
    to: clientEmail,
    subject: `Payment Confirmed - Invoice ${invoiceNumber} - Uniquitous Music`,
    html,
  })
}

export const sendContractorFeeEmail = async (
  clientEmail: string,
  clientName: string,
  invoiceNumber: string,
  contractorName: string,
  contractorSkills: string[],
  contractorNotes: string,
  amount: number,
  paymentUrl: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Uniquitous Music</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Music Production Services</p>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #333; margin-bottom: 20px;">Contractor Fee Payment Request</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Dear ${clientName},
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          We're requesting payment for a contractor fee associated with invoice #${invoiceNumber}. 
          Please review the details below and complete your payment.
        </p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #6366f1;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Contractor Fee Details</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Contractor:</strong> ${contractorName}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Skills:</strong> ${contractorSkills.join(', ')}</p>
          ${contractorNotes ? `<p style="margin: 5px 0; color: #666;"><strong>Notes:</strong> ${contractorNotes}</p>` : ''}
          <p style="margin: 15px 0 5px 0; color: #333; font-size: 18px;"><strong>Amount Due:</strong> $${amount.toLocaleString()}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${paymentUrl}" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Pay Contractor Fee - $${amount.toLocaleString()}
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Payment can be made securely online using the button above. We accept all major credit cards 
          and bank transfers. If you have any questions about this contractor fee, please contact us at 
          george@uniquitousmusic.com or call (609) 316-8080.
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          Thank you for your business!
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
          <p>Uniquitous Music<br>
          george@uniquitousmusic.com<br>
          (609) 316-8080</p>
        </div>
      </div>
    </div>
  `

  return sendEmail({
    to: clientEmail,
    subject: `Contractor Fee Payment Request - Invoice ${invoiceNumber} - Uniquitous Music`,
    html,
  })
}

export const sendBulkContractorFeeEmail = async (
  clientEmail: string,
  clientName: string,
  invoiceNumber: string,
  contractors: Array<{
    name: string
    skills: string[]
    notes: string
    amount: number
  }>,
  totalAmount: number,
  paymentUrl: string,
  bulkBillingGroupId: string
) => {
  const contractorDetailsHtml = contractors.map(contractor => `
    <div style="background: #f8f9fa; border-radius: 6px; padding: 15px; margin-bottom: 15px; border-left: 3px solid #6366f1;">
      <p style="margin: 5px 0; color: #333; font-weight: 600;">${contractor.name}</p>
      <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Skills:</strong> ${contractor.skills.join(', ')}</p>
      ${contractor.notes ? `<p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Notes:</strong> ${contractor.notes}</p>` : ''}
      <p style="margin: 10px 0 5px 0; color: #333; font-size: 16px; font-weight: 600;">Amount: $${contractor.amount.toLocaleString()}</p>
    </div>
  `).join('')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Uniquitous Music</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Music Production Services</p>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #333; margin-bottom: 20px;">Contractor Fee Payment Request</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Dear ${clientName},
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          We're requesting payment for contractor fees associated with invoice #${invoiceNumber}. 
          Please review the details below and complete your payment.
        </p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #6366f1;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Contractor Fee Details</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p style="margin: 15px 0 10px 0; color: #333; font-weight: 600;">Contractors:</p>
          ${contractorDetailsHtml}
          <div style="border-top: 2px solid #6366f1; margin-top: 20px; padding-top: 15px;">
            <p style="margin: 0; color: #333; font-size: 20px; font-weight: bold;"><strong>Total Amount Due:</strong> $${totalAmount.toLocaleString()}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${paymentUrl}" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Pay All Contractor Fees - $${totalAmount.toLocaleString()}
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Payment can be made securely online using the button above. We accept all major credit cards 
          and bank transfers. If you have any questions about these contractor fees, please contact us at 
          george@uniquitousmusic.com or call (609) 316-8080.
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          Thank you for your business!
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
          <p>Uniquitous Music<br>
          george@uniquitousmusic.com<br>
          (609) 316-8080</p>
        </div>
      </div>
    </div>
  `

  return sendEmail({
    to: clientEmail,
    subject: `Contractor Fee Payment Request - Invoice ${invoiceNumber} - Uniquitous Music`,
    html,
  })
}
