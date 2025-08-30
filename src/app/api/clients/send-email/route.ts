import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clientId, to, subject, message } = await request.json()

    if (!clientId || !to || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: user.id
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Create HTML email template
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Uniquitous Music</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Music Production Services</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
            <div style="color: #666; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions or need to discuss this further, 
            please don't hesitate to reach out to us at george@uniquitousmusic.com or call (609) 316-8080.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
            <p>Uniquitous Music<br>
            george@uniquitousmusic.com<br>
            (609) 316-8080</p>
          </div>
        </div>
      </div>
    `

    try {
      await sendEmail({
        to,
        subject,
        html,
      })

      console.log('Client email sent successfully:', {
        to,
        clientId,
        clientName: client.name,
        subject
      })

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully'
      })

    } catch (emailError) {
      console.error('Failed to send client email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send email. Please try again.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error sending client email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
