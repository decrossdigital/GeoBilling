import { NextRequest, NextResponse } from 'next/server'
import { sendQuoteEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { clientEmail, clientName, quoteNumber, amount, quoteUrl } = await request.json()

    if (!clientEmail || !clientName || !quoteNumber || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await sendQuoteEmail(clientEmail, clientName, quoteNumber, amount, quoteUrl)

    return NextResponse.json({
      success: true,
      message: 'Quote email sent successfully'
    })
  } catch (error) {
    console.error('Quote email error:', error)
    return NextResponse.json(
      { error: 'Failed to send quote email' },
      { status: 500 }
    )
  }
}
