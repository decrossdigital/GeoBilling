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
  invoiceUrl: string
) => {
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
          <p style="margin: 5px 0; color: #666;"><strong>Amount Due:</strong> $${amount.toLocaleString()}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invoiceUrl}" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Pay Invoice
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Payment can be made securely online using the button above. We accept all major credit cards 
          and bank transfers. If you have any questions about this invoice, please contact us at 
          george@uniquitousmusic.com or call (609) 316-8080.
        </p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>Payment Terms:</strong> Payment is due within 30 days of invoice date. 
            Late payments may incur additional fees.
          </p>
        </div>
        
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
