"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import UserMenu from "@/components/user-menu"
import { Home, FileText, Users, DollarSign, TrendingUp, BarChart3, Settings, User, ArrowUpRight, ArrowDownRight, Music } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

interface AnalyticsData {
  overview: {
    totalClients: number
    totalQuotes: number
    totalInvoices: number
    totalPayments: number
    totalRevenue: number
  }
  charts: {
    monthlyRevenue: any[]
    quoteStatuses: any[]
    invoiceStatuses: any[]
  }
  topClients: any[]
  recentActivity: {
    quotes: any[]
    invoices: any[]
    payments: any[]
  }
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!session) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/analytics?period=${period}`)
        if (response.ok) {
          const data = await response.json()
          setAnalyticsData(data)
        } else {
          console.error('Failed to fetch analytics')
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [session, period])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (loading) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', textAlign: 'center'}}>
          <div style={{fontSize: '1.5rem', color: 'white'}}>Loading analytics...</div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', textAlign: 'center'}}>
          <div style={{fontSize: '1.5rem', color: 'white'}}>Failed to load analytics</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white'}}>
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem'}}>
        {/* Header */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #9333ea, #ec4899)', borderRadius: '1rem'}}>
              <Music style={{height: '2rem', width: '2rem', color: 'white'}} />
            </div>
            <div>
              <h1 style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white'}}>GeoBilling</h1>
              <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Uniquitous Music - Professional Billing System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <Link href="/" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <Home style={{height: '1rem', width: '1rem'}} />
                <span>Dashboard</span>
              </Link>
              <Link href="/clients" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <Users style={{height: '1rem', width: '1rem'}} />
                <span>Clients</span>
              </Link>
              <Link href="/quotes" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <FileText style={{height: '1rem', width: '1rem'}} />
                <span>Quotes</span>
              </Link>
              <Link href="/invoices" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <DollarSign style={{height: '1rem', width: '1rem'}} />
                <span>Invoices</span>
              </Link>
              <Link href="/contractors" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <User style={{height: '1rem', width: '1rem'}} />
                <span>Contractors</span>
              </Link>
              <Link href="/analytics" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'linear-gradient(to right, #9333ea, #3b82f6)', color: 'white', textDecoration: 'none', fontWeight: '500', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}>
                <BarChart3 style={{height: '1rem', width: '1rem'}} />
                <span>Analytics</span>
              </Link>

              <Link href="/settings" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <Settings style={{height: '1rem', width: '1rem'}} />
                <span>Settings</span>
              </Link>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div style={{marginBottom: '2rem'}}>
          <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>Analytics Dashboard</h1>
          <p style={{color: '#cbd5e1', fontSize: '1.125rem'}}>Track your business performance and insights</p>
        </div>

        {/* Period Selector */}
        <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center'}}>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: 'white',
              outline: 'none'
            }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Content */}
        <div style={{padding: '2rem'}}>
          {/* Key Metrics */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div>
                  <p style={{color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Total Revenue</p>
                  <p style={{color: 'white', fontSize: '1.875rem', fontWeight: 'bold'}}>{formatCurrency(analyticsData.overview.totalRevenue)}</p>
                </div>
                <div style={{padding: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.2)', borderRadius: '0.5rem'}}>
                  <ArrowUpRight style={{height: '1.5rem', width: '1.5rem', color: '#22c55e'}} />
                </div>
              </div>
            </div>

            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div>
                  <p style={{color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Total Clients</p>
                  <p style={{color: 'white', fontSize: '1.875rem', fontWeight: 'bold'}}>{analyticsData.overview.totalClients}</p>
                </div>
                <div style={{padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '0.5rem'}}>
                  <Users style={{height: '1.5rem', width: '1.5rem', color: '#3b82f6'}} />
                </div>
              </div>
            </div>

            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div>
                  <p style={{color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Total Quotes</p>
                  <p style={{color: 'white', fontSize: '1.875rem', fontWeight: 'bold'}}>{analyticsData.overview.totalQuotes}</p>
                </div>
                <div style={{padding: '0.75rem', backgroundColor: 'rgba(168, 85, 247, 0.2)', borderRadius: '0.5rem'}}>
                  <FileText style={{height: '1.5rem', width: '1.5rem', color: '#a855f7'}} />
                </div>
              </div>
            </div>

            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div>
                  <p style={{color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem'}}>Total Invoices</p>
                  <p style={{color: 'white', fontSize: '1.875rem', fontWeight: 'bold'}}>{analyticsData.overview.totalInvoices}</p>
                </div>
                <div style={{padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.2)', borderRadius: '0.5rem'}}>
                  <DollarSign style={{height: '1.5rem', width: '1.5rem', color: '#f59e0b'}} />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem'}}>
            {/* Revenue Chart */}
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.charts.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255, 255, 255, 0.7)"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  />
                  <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white'
                    }}
                    formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution */}
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Quote Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.charts.quoteStatuses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="_count.status"
                  >
                    {analyticsData.charts.quoteStatuses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Clients & Recent Activity */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
            {/* Top Clients */}
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Top Clients</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {analyticsData.topClients.map((client, index) => (
                  <div key={index} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem'}}>
                    <div>
                      <p style={{color: 'white', fontWeight: '500'}}>{client.clientName}</p>
                      <p style={{color: '#cbd5e1', fontSize: '0.875rem'}}>{client.clientEmail}</p>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <p style={{color: 'white', fontWeight: 'bold'}}>{formatCurrency(client.revenue)}</p>
                      <p style={{color: '#cbd5e1', fontSize: '0.875rem'}}>{client.invoiceCount} invoices</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Recent Activity</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {analyticsData.recentActivity.payments.slice(0, 5).map((payment, index) => (
                  <div key={index} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem'}}>
                    <div>
                      <p style={{color: 'white', fontWeight: '500'}}>Payment #{payment.paymentNumber}</p>
                      <p style={{color: '#cbd5e1', fontSize: '0.875rem'}}>{payment.invoice?.client?.name}</p>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <p style={{color: 'white', fontWeight: 'bold'}}>{formatCurrency(payment.amount)}</p>
                      <p style={{color: '#cbd5e1', fontSize: '0.875rem'}}>{formatDate(payment.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
