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

    const totalPayments = await prisma.payment.count({
      where: {
        invoice: {
          userId: user.id
        }
      }
    })

    // Get revenue data
    const revenueData = await prisma.payment.aggregate({
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

    const totalRevenue = revenueData._sum.amount || 0

    // Get monthly revenue for chart
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', p."createdAt") as month,
        SUM(p.amount) as revenue
      FROM payments p
      JOIN invoices i ON p."invoiceId" = i.id
      WHERE i."userId" = ${user.id} 
        AND p.status = 'completed'
        AND p."createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('month', p."createdAt")
      ORDER BY month
    `

    // Get quote status distribution
    const quoteStatuses = await prisma.quote.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: {
        status: true
      }
    })

    // Get invoice status distribution
    const invoiceStatuses = await prisma.invoice.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: {
        status: true
      }
    })

    // Get top clients by revenue
    const topClients = await prisma.payment.groupBy({
      by: ['invoiceId'],
      where: {
        status: 'completed',
        invoice: {
          userId: user.id
        }
      },
      _sum: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: 5
    })

    // Get client details for top clients
    const topClientsWithDetails = await Promise.all(
      topClients.map(async (payment: any) => {
        const invoice = await prisma.invoice.findUnique({
          where: { id: payment.invoiceId },
          include: { client: true }
        })
        return {
          clientName: invoice?.client.name || 'Unknown',
          revenue: payment._sum.amount || 0
        }
      })
    )

    // Get recent activity
    const recentQuotes = await prisma.quote.findMany({
      where: { userId: user.id },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const recentInvoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
      take: 5
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
      take: 5
    })

    return NextResponse.json({
      overview: {
        totalClients,
        totalQuotes,
        totalInvoices,
        totalPayments,
        totalRevenue: parseFloat(totalRevenue.toString())
      },
      charts: {
        monthlyRevenue,
        quoteStatuses,
        invoiceStatuses
      },
      topClients: topClientsWithDetails,
      recentActivity: {
        quotes: recentQuotes,
        invoices: recentInvoices,
        payments: recentPayments
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
