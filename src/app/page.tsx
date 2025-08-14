"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import Link from "next/link"
import UserMenu from "@/components/user-menu"
import {
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  Music,
  BarChart3,
  Plus,
  ArrowUpRight,
  Star,
  Home,
  User,
  Settings
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'

interface DashboardData {
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

interface ReportData {
  type: string
  data: any
}

export default function Dashboard() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState('overview')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/analytics')
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        } else {
          console.error('Failed to fetch dashboard data')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchReportData = async () => {
      try {
        const params = new URLSearchParams({ type: reportType })
        const response = await fetch(`/api/reports?${params}`)
        if (response.ok) {
          const data = await response.json()
          setReportData(data)
        }
      } catch (error) {
        console.error('Error fetching report data:', error)
      }
    }

    fetchDashboardData()
    fetchReportData()
  }, [reportType])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
      <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '1.5rem', marginBottom: '1rem'}}>Loading dashboard...</div>
          <div style={{width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto'}}></div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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
              <Link href="/" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'linear-gradient(to right, #9333ea, #3b82f6)', color: 'white', textDecoration: 'none', fontWeight: '500', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}>
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
              <Link href="/analytics" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
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

        {/* Stats Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem'}}>
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Total Revenue</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
                  {dashboardData ? formatCurrency(dashboardData.totalRevenue) : '$0'}
                </p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.875rem', color: '#34d399'}}>+12.5%</span>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>from last month</span>
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
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Active Quotes</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
                  {dashboardData ? dashboardData.totalQuotes : 0}
                </p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.875rem', color: '#60a5fa'}}>+2</span>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>from last month</span>
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
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Pending Invoices</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
                  {dashboardData ? dashboardData.pendingInvoices : 0}
                </p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.875rem', color: '#f87171'}}>-3</span>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>from last month</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #f97316, #ef4444)', borderRadius: '0.75rem'}}>
                <TrendingUp style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>

          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Active Clients</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
                  {dashboardData ? dashboardData.totalClients : 0}
                </p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <span style={{fontSize: '0.875rem', color: '#a78bfa'}}>+5</span>
                  <span style={{fontSize: '0.75rem', color: '#cbd5e1'}}>from last month</span>
                </div>
              </div>
              <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', borderRadius: '0.75rem'}}>
                <Users style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{marginBottom: '3rem'}}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem'}}>Quick Actions</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
            <Link href="/quotes/new" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', textDecoration: 'none', display: 'block'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #2563eb, #4f46e5)', borderRadius: '0.75rem'}}>
                  <Plus style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
                </div>
                <ArrowUpRight style={{height: '1.25rem', width: '1.25rem', color: '#94a3b8'}} />
              </div>
              <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '0.5rem'}}>New Quote</h3>
              <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Create a professional quote for a client</p>
            </Link>

            <Link href="/invoices/new" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', textDecoration: 'none', display: 'block'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #059669, #0d9488)', borderRadius: '0.75rem'}}>
                  <DollarSign style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
                </div>
                <ArrowUpRight style={{height: '1.25rem', width: '1.25rem', color: '#94a3b8'}} />
              </div>
              <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '0.5rem'}}>New Invoice</h3>
              <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Generate an invoice for completed work</p>
            </Link>

            <Link href="/clients" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', textDecoration: 'none', display: 'block'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', borderRadius: '0.75rem'}}>
                  <Users style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
                </div>
                <ArrowUpRight style={{height: '1.25rem', width: '1.25rem', color: '#94a3b8'}} />
              </div>
              <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '0.5rem'}}>Manage Clients</h3>
              <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>View and manage your client database</p>
            </Link>

            <Link href="/analytics" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', textDecoration: 'none', display: 'block'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #7c3aed, #6366f1)', borderRadius: '0.75rem'}}>
                  <BarChart3 style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
                </div>
                <ArrowUpRight style={{height: '1.25rem', width: '1.25rem', color: '#94a3b8'}} />
              </div>
              <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '0.5rem'}}>Analytics</h3>
              <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>View business insights and metrics</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity and Quick Stats */}
        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '3rem'}}>
          {/* Recent Activity */}
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white'}}>Recent Activity</h2>
              <button style={{fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#cbd5e1', border: 'none', borderRadius: '0.5rem', cursor: 'pointer'}}>View All</button>
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {dashboardData && dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity) => {
                  const statusColors = getStatusColor(activity.status)
                  return (
                    <div key={activity.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                        <div style={{padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: getActivityIconBg(activity.type)}}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <p style={{fontWeight: '500', color: 'white'}}>{activity.title}</p>
                          <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{formatDate(activity.date)}</p>
                        </div>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <p style={{fontWeight: '500', color: 'white'}}>{formatCurrency(activity.amount)}</p>
                        <span style={{fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '9999px', backgroundColor: statusColors.bg, color: statusColors.color}}>{activity.status}</span>
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
          
          {/* Quick Stats */}
          <div>
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem'}}>This Month</h2>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <div style={{padding: '0.5rem', backgroundColor: 'rgba(34, 197, 94, 0.2)', borderRadius: '0.5rem'}}>
                      <DollarSign style={{height: '1rem', width: '1rem', color: '#34d399'}} />
                    </div>
                    <div>
                      <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Revenue</p>
                      <p style={{fontWeight: '500', color: 'white'}}>
                        {dashboardData ? formatCurrency(dashboardData.monthlyRevenue) : '$0'}
                      </p>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <p style={{color: '#34d399', fontSize: '0.875rem'}}>+18%</p>
                  </div>
                </div>

                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <div style={{padding: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '0.5rem'}}>
                      <FileText style={{height: '1rem', width: '1rem', color: '#60a5fa'}} />
                    </div>
                    <div>
                      <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Quotes</p>
                      <p style={{fontWeight: '500', color: 'white'}}>
                        {dashboardData ? dashboardData.totalQuotes : 0}
                      </p>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <p style={{color: '#60a5fa', fontSize: '0.875rem'}}>+3</p>
                  </div>
                </div>

                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <div style={{padding: '0.5rem', backgroundColor: 'rgba(147, 51, 234, 0.2)', borderRadius: '0.5rem'}}>
                      <Users style={{height: '1rem', width: '1rem', color: '#a78bfa'}} />
                    </div>
                    <div>
                      <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>New Clients</p>
                      <p style={{fontWeight: '500', color: 'white'}}>
                        {dashboardData ? Math.floor(dashboardData.totalClients * 0.3) : 0}
                      </p>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <p style={{color: '#a78bfa', fontSize: '0.875rem'}}>+2</p>
                  </div>
                </div>

                <div style={{paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                    <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Client Satisfaction</p>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                      <Star style={{height: '1rem', width: '1rem', color: '#fbbf24'}} />
                      <span style={{fontWeight: '500', color: 'white'}}>4.9</span>
                    </div>
                  </div>
                  <div style={{width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', height: '0.5rem'}}>
                    <div style={{background: 'linear-gradient(to right, #fbbf24, #f59e0b)', height: '0.5rem', borderRadius: '9999px', width: '98%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div style={{marginBottom: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white'}}>Business Reports</h2>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button
                onClick={() => setReportType('overview')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: reportType === 'overview' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Overview
              </button>
              <button
                onClick={() => setReportType('revenue')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: reportType === 'revenue' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Revenue
              </button>
              <button
                onClick={() => setReportType('invoices')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: reportType === 'invoices' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Invoices
              </button>
            </div>
          </div>

          {reportData && (
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              {reportType === 'overview' && (
                <div>
                  <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Business Overview</h3>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                    <div style={{padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem'}}>
                      <p style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Total Revenue</p>
                      <p style={{color: 'white', fontSize: '1.5rem', fontWeight: 'bold'}}>{formatCurrency(reportData.data.totalRevenue)}</p>
                    </div>
                    <div style={{padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem'}}>
                      <p style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Total Quotes</p>
                      <p style={{color: 'white', fontSize: '1.5rem', fontWeight: 'bold'}}>{reportData.data.totalQuotes}</p>
                    </div>
                    <div style={{padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem'}}>
                      <p style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Total Invoices</p>
                      <p style={{color: 'white', fontSize: '1.5rem', fontWeight: 'bold'}}>{reportData.data.totalInvoices}</p>
                    </div>
                    <div style={{padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem'}}>
                      <p style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Total Clients</p>
                      <p style={{color: 'white', fontSize: '1.5rem', fontWeight: 'bold'}}>{reportData.data.totalClients}</p>
                    </div>
                    <div style={{padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem'}}>
                      <p style={{color: '#cbd5e1', fontSize: '0.875rem'}}>Conversion Rate</p>
                      <p style={{color: 'white', fontSize: '1.5rem', fontWeight: 'bold'}}>{reportData.data.conversionRate}%</p>
                    </div>
                  </div>
                </div>
              )}

              {reportType === 'revenue' && reportData.data.monthlyRevenue && (
                <div>
                  <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Monthly Revenue</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={reportData.data.monthlyRevenue}>
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
              )}

              {reportType === 'invoices' && reportData.data.statuses && (
                <div>
                  <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Invoice Status Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.data.statuses}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percent }) => `${status} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="_count.status"
                      >
                        {reportData.data.statuses.map((entry: any, index: number) => (
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
