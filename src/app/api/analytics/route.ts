import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/analytics - Get analytics data for dashboard
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Get basic counts
    const totalClients = await prisma.client.count({
      where: { userId: user.id }
    })

    const totalQuotes = await prisma.quote.count({
      where: { userId: user.id }
    })

    const totalInvoices = await prisma.invoice.count({
      where: { userId: user.id }
    })

    const pendingInvoices = await prisma.invoice.count({
      where: { 
        userId: user.id,
        status: 'pending'
      }
    })

    // Get total revenue
    const totalRevenueData = await prisma.payment.aggregate({
      where: {
        status: 'completed',
        invoice: {
          userId: user.id
        }
      },
      _sum: {
        amount: true
      }
    })

    const totalRevenue = totalRevenueData._sum.amount || 0

    // Get monthly revenue
    const monthlyRevenueData = await prisma.payment.aggregate({
      where: {
        status: 'completed',
        createdAt: {
          gte: startDate
        },
        invoice: {
          userId: user.id
        }
      },
      _sum: {
        amount: true
      }
    })

    const monthlyRevenue = monthlyRevenueData._sum.amount || 0

    // Get recent activity - combine quotes, invoices, and payments
    const recentQuotes = await prisma.quote.findMany({
      where: { userId: user.id },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    const recentInvoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    const recentPayments = await prisma.payment.findMany({
      where: {
        invoice: {
          userId: user.id
        }
      },
      include: {
        invoice: {
          include: { client: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    // Combine and format recent activity
    const recentActivity = [
      ...recentQuotes.map(quote => ({
        id: quote.id,
        type: 'quote' as const,
        title: `${quote.title || 'Quote'} - ${quote.client?.name || 'Unknown Client'}`,
        amount: quote.total || 0,
        status: quote.status,
        date: quote.createdAt.toISOString()
      })),
      ...recentInvoices.map(invoice => ({
        id: invoice.id,
        type: 'invoice' as const,
        title: `${invoice.title || 'Invoice'} - ${invoice.client?.name || 'Unknown Client'}`,
        amount: invoice.total || 0,
        status: invoice.status,
        date: invoice.createdAt.toISOString()
      })),
      ...recentPayments.map(payment => ({
        id: payment.id,
        type: 'payment' as const,
        title: `Payment - ${payment.invoice?.client?.name || 'Unknown Client'}`,
        amount: payment.amount || 0,
        status: payment.status,
        date: payment.createdAt.toISOString()
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

    return NextResponse.json({
      totalRevenue: parseFloat(totalRevenue.toString()),
      totalClients,
      totalQuotes,
      totalInvoices,
      pendingInvoices,
      monthlyRevenue: parseFloat(monthlyRevenue.toString()),
      recentActivity
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
