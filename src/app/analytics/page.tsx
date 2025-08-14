"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import UserMenu from "@/components/user-menu"
import { Home, FileText, Users, DollarSign, TrendingUp, BarChart3, Settings, User, ArrowUpRight, ArrowDownRight, Music } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

interface AnalyticsData {
  totalRevenue: number
  totalClients: number
  totalQuotes: number
  totalInvoices: number
  pendingInvoices: number
  monthlyRevenue: number
  recentActivity: Array<{
    id: string
    type: 'invoice' | 'quote' | 'payment'
    title: string
    amount: number
    status: string
    date: string
  }>
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
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return { bg: 'rgba(34, 197, 94, 0.2)', color: '#34d399' }
      case 'pending':
        return { bg: 'rgba(251, 146, 60, 0.2)', color: '#fb923c' }
      case 'overdue':
        return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }
      case 'draft':
        return { bg: 'rgba(107, 114, 128, 0.2)', color: '#6b7280' }
      default:
        return { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <DollarSign style={{height: '1rem', width: '1rem', color: '#60a5fa'}} />
      case 'quote':
        return <FileText style={{height: '1rem', width: '1rem', color: '#a78bfa'}} />
      case 'payment':
        return <TrendingUp style={{height: '1rem', width: '1rem', color: '#34d399'}} />
      default:
        return <DollarSign style={{height: '1rem', width: '1rem', color: '#60a5fa'}} />
    }
  }

  const getActivityIconBg = (type: string) => {
    switch (type) {
      case 'invoice':
        return 'rgba(59, 130, 246, 0.2)'
      case 'quote':
        return 'rgba(147, 51, 234, 0.2)'
      case 'payment':
        return 'rgba(34, 197, 94, 0.2)'
      default:
        return 'rgba(59, 130, 246, 0.2)'
    }
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
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem'}}>
          <div>
            <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white'}}>Analytics</h1>
            <p style={{color: '#cbd5e1'}}>Comprehensive business insights and performance metrics</p>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem'
              }}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem'}}>
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Total Revenue</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
                  {formatCurrency(analyticsData.totalRevenue)}
                </p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <ArrowUpRight style={{height: '1rem', width: '1rem', color: '#34d399'}} />
                  <span style={{fontSize: '0.875rem', color: '#34d399'}}>+12.5%</span>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>from last period</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #10b981, #14b8a6)', borderRadius: '0.75rem'}}>
                <DollarSign style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Total Clients</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
                  {analyticsData.totalClients}
                </p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <ArrowUpRight style={{height: '1rem', width: '1rem', color: '#a78bfa'}} />
                  <span style={{fontSize: '0.875rem', color: '#a78bfa'}}>+5</span>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>from last period</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', borderRadius: '0.75rem'}}>
                <Users style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Total Quotes</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
                  {analyticsData.totalQuotes}
                </p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <ArrowUpRight style={{height: '1rem', width: '1rem', color: '#60a5fa'}} />
                  <span style={{fontSize: '0.875rem', color: '#60a5fa'}}>+2</span>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>from last period</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #3b82f6, #6366f1)', borderRadius: '0.75rem'}}>
                <FileText style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Total Invoices</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
                  {analyticsData.totalInvoices}
                </p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <ArrowUpRight style={{height: '1rem', width: '1rem', color: '#f59e0b'}} />
                  <span style={{fontSize: '0.875rem', color: '#f59e0b'}}>+8</span>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>from last period</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #f97316, #ef4444)', borderRadius: '0.75rem'}}>
                <TrendingUp style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Recent Activity */}
        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem'}}>
          {/* Revenue Chart */}
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Revenue Overview</h3>
            <div style={{height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1'}}>
              <p>Revenue chart data will be available in the next update</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Recent Activity</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {analyticsData.recentActivity.length > 0 ? (
                analyticsData.recentActivity.map((activity) => {
                  const statusColors = getStatusColor(activity.status)
                  return (
                    <div key={activity.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                        <div style={{padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: getActivityIconBg(activity.type)}}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <p style={{fontWeight: '500', color: 'white', fontSize: '0.875rem'}}>{activity.title}</p>
                          <p style={{fontSize: '0.75rem', color: '#cbd5e1'}}>{formatDate(activity.date)}</p>
                        </div>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <p style={{fontWeight: '500', color: 'white', fontSize: '0.875rem'}}>{formatCurrency(activity.amount)}</p>
                        <span style={{fontSize: '0.625rem', padding: '0.125rem 0.375rem', borderRadius: '9999px', backgroundColor: statusColors.bg, color: statusColors.color}}>{activity.status}</span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{textAlign: 'center', padding: '2rem', color: '#cbd5e1'}}>
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
