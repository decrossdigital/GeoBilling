import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/reports - Get business reports
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
    const reportType = searchParams.get('type') || 'overview'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    }

    switch (reportType) {
      case 'revenue':
        return await getRevenueReport(user.id, dateFilter)
      case 'clients':
        return await getClientReport(user.id, dateFilter)
      case 'quotes':
        return await getQuoteReport(user.id, dateFilter)
      case 'invoices':
        return await getInvoiceReport(user.id, dateFilter)
      case 'payments':
        return await getPaymentReport(user.id, dateFilter)
      default:
        return await getOverviewReport(user.id, dateFilter)
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getOverviewReport(userId: string, dateFilter: any) {
  const totalRevenue = await prisma.payment.aggregate({
    where: {
      status: 'completed',
      ...dateFilter,
      invoice: {
        userId
      }
    },
    _sum: { amount: true }
  })

  const totalQuotes = await prisma.quote.count({
    where: { userId, ...dateFilter }
  })

  const totalInvoices = await prisma.invoice.count({
    where: { userId, ...dateFilter }
  })

  const totalClients = await prisma.client.count({
    where: { userId }
  })

  const conversionRate = totalQuotes > 0 ? (totalInvoices / totalQuotes) * 100 : 0

  return NextResponse.json({
    type: 'overview',
    data: {
      totalRevenue: parseFloat(totalRevenue._sum.amount?.toString() || '0'),
      totalQuotes,
      totalInvoices,
      totalClients,
      conversionRate: Math.round(conversionRate * 100) / 100
    }
  })
}

async function getRevenueReport(userId: string, dateFilter: any) {
  const monthlyRevenue = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', p."createdAt") as month,
      SUM(p.amount) as revenue,
      COUNT(*) as paymentCount
    FROM payments p
    JOIN invoices i ON p."invoiceId" = i.id
    WHERE i."userId" = ${userId} 
      AND p.status = 'completed'
      ${dateFilter.createdAt ? `AND p."createdAt" >= ${dateFilter.createdAt.gte}` : ''}
      ${dateFilter.createdAt ? `AND p."createdAt" <= ${dateFilter.createdAt.lte}` : ''}
    GROUP BY DATE_TRUNC('month', p."createdAt")
    ORDER BY month
  `

  const paymentMethods = await prisma.payment.groupBy({
    by: ['paymentMethod'],
    where: {
      status: 'completed',
      ...dateFilter,
      invoice: {
        userId
      }
    },
    _sum: { amount: true },
    _count: { paymentMethod: true }
  })

  return NextResponse.json({
    type: 'revenue',
    data: {
      monthlyRevenue,
      paymentMethods
    }
  })
}

async function getClientReport(userId: string, dateFilter: any) {
  const topClients = await prisma.payment.groupBy({
    by: ['invoiceId'],
    where: {
      status: 'completed',
      ...dateFilter,
      invoice: {
        userId
      }
    },
    _sum: { amount: true },
    orderBy: {
      _sum: { amount: 'desc' }
    },
    take: 10
  })

  const clientDetails = await Promise.all(
    topClients.map(async (payment: any) => {
      const invoice = await prisma.invoice.findUnique({
        where: { id: payment.invoiceId },
        include: { client: true }
      })
      return {
        clientName: invoice?.client.name || 'Unknown',
        clientEmail: invoice?.client.email || '',
        revenue: payment._sum.amount || 0,
        invoiceCount: 1
      }
    })
  )

  return NextResponse.json({
    type: 'clients',
    data: {
      topClients: clientDetails
    }
  })
}

async function getQuoteReport(userId: string, dateFilter: any) {
  const quoteStatuses = await prisma.quote.groupBy({
    by: ['status'],
    where: { userId, ...dateFilter },
    _count: { status: true },
    _sum: { total: true }
  })

  const monthlyQuotes = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "createdAt") as month,
      COUNT(*) as quoteCount,
      SUM(total) as totalValue
    FROM quotes 
    WHERE "userId" = ${userId}
      ${dateFilter.createdAt ? `AND "createdAt" >= ${dateFilter.createdAt.gte}` : ''}
      ${dateFilter.createdAt ? `AND "createdAt" <= ${dateFilter.createdAt.lte}` : ''}
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month
  `

  return NextResponse.json({
    type: 'quotes',
    data: {
      statuses: quoteStatuses,
      monthlyQuotes
    }
  })
}

async function getInvoiceReport(userId: string, dateFilter: any) {
  const invoiceStatuses = await prisma.invoice.groupBy({
    by: ['status'],
    where: { userId, ...dateFilter },
    _count: { status: true },
    _sum: { total: true }
  })

  const monthlyInvoices = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "createdAt") as month,
      COUNT(*) as invoiceCount,
      SUM(total) as totalValue
    FROM invoices 
    WHERE "userId" = ${userId}
      ${dateFilter.createdAt ? `AND "createdAt" >= ${dateFilter.createdAt.gte}` : ''}
      ${dateFilter.createdAt ? `AND "createdAt" <= ${dateFilter.createdAt.lte}` : ''}
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month
  `

  return NextResponse.json({
    type: 'invoices',
    data: {
      statuses: invoiceStatuses,
      monthlyInvoices
    }
  })
}

async function getPaymentReport(userId: string, dateFilter: any) {
  const paymentStatuses = await prisma.payment.groupBy({
    by: ['status'],
    where: { ...dateFilter, invoice: { userId } },
    _count: { status: true },
    _sum: { amount: true }
  })

  const monthlyPayments = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', p."createdAt") as month,
      COUNT(*) as paymentCount,
      SUM(p.amount) as totalAmount
    FROM payments p
    JOIN invoices i ON p."invoiceId" = i.id
    WHERE i."userId" = ${userId}
      ${dateFilter.createdAt ? `AND p."createdAt" >= ${dateFilter.createdAt.gte}` : ''}
      ${dateFilter.createdAt ? `AND p."createdAt" <= ${dateFilter.createdAt.lte}` : ''}
    GROUP BY DATE_TRUNC('month', p."createdAt")
    ORDER BY month
  `

  return NextResponse.json({
    type: 'payments',
    data: {
      statuses: paymentStatuses,
      monthlyPayments
    }
  })
}
