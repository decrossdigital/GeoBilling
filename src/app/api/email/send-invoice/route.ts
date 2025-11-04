import { NextRequest, NextResponse } from 'next/server'
import { sendInvoiceEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { clientEmail, clientName, invoiceNumber, amount, dueDate, invoiceUrl, terms, termsUrl, payments } = await request.json()

    if (!clientEmail || !clientName || !invoiceNumber || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await sendInvoiceEmail(clientEmail, clientName, invoiceNumber, amount, dueDate, invoiceUrl, terms, termsUrl, payments)

    return NextResponse.json({
      success: true,
      message: 'Invoice email sent successfully'
    })
  } catch (error) {
    console.error('Invoice email error:', error)
    return NextResponse.json(
      { error: 'Failed to send invoice email' },
      { status: 500 }
    )
  }
}
