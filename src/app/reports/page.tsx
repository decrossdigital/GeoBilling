"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import UserMenu from "@/components/user-menu"
import { Home, FileText, Users, DollarSign, TrendingUp, BarChart3, Settings, User, Download, Calendar, Filter, Music } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'

interface ReportData {
  type: string
  data: any
}

export default function ReportsPage() {
  const { data: session } = useSession()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState('overview')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    const fetchReport = async () => {
      if (!session) return
      
      try {
        setLoading(true)
        const params = new URLSearchParams({
          type: reportType
        })
        
        if (startDate && endDate) {
          params.append('startDate', startDate)
          params.append('endDate', endDate)
        }
        
        const response = await fetch(`/api/reports?${params}`)
        if (response.ok) {
          const data = await response.json()
          setReportData(data)
        } else {
          console.error('Failed to fetch report')
        }
      } catch (error) {
        console.error('Error fetching report:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [session, reportType, startDate, endDate])

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

  const renderReportContent = () => {
    if (!reportData) return null

    switch (reportType) {
      case 'revenue':
        return (
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
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
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Payment Methods</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.data.paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ paymentMethod, percent }) => `${paymentMethod} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="_sum.amount"
                  >
                    {reportData.data.paymentMethods.map((entry: any, index: number) => (
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
                    formatter={(value: any) => [formatCurrency(value), 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case 'clients':
        return (
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Top Clients by Revenue</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {reportData.data.topClients.map((client: any, index: number) => (
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
        )

      case 'quotes':
        return (
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Quote Status Distribution</h3>
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
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Monthly Quotes</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.data.monthlyQuotes}>
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
                    formatter={(value: any) => [value, 'Quotes']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Bar dataKey="quoteCount" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case 'invoices':
        return (
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
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
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Monthly Invoices</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.data.monthlyInvoices}>
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
                    formatter={(value: any) => [value, 'Invoices']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Bar dataKey="invoiceCount" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case 'payments':
        return (
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Payment Status Distribution</h3>
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
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
              <h3 style={{color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem'}}>Monthly Payments</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.data.monthlyPayments}>
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
                    formatter={(value: any) => [formatCurrency(value), 'Amount']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Bar dataKey="totalAmount" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      default: // overview
        return (
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
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
        )
    }
  }

  if (loading) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)', color: 'white'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', textAlign: 'center'}}>
          <div style={{fontSize: '1.5rem', color: 'white'}}>Loading report...</div>
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
              <Link href="/analytics" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <BarChart3 style={{height: '1rem', width: '1rem'}} />
                <span>Analytics</span>
              </Link>
              <Link href="/reports" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'linear-gradient(to right, #9333ea, #3b82f6)', color: 'white', textDecoration: 'none', fontWeight: '500', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}>
                <TrendingUp style={{height: '1rem', width: '1rem'}} />
                <span>Reports</span>
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
          <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>Business Reports</h1>
          <p style={{color: '#cbd5e1', fontSize: '1.125rem'}}>Generate detailed business reports and insights</p>
        </div>

        {/* Report Controls */}
        <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center'}}>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: 'white',
              outline: 'none'
            }}
          >
            <option value="overview">Overview</option>
            <option value="revenue">Revenue Report</option>
            <option value="clients">Client Report</option>
            <option value="quotes">Quote Report</option>
            <option value="invoices">Invoice Report</option>
            <option value="payments">Payment Report</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: 'white',
              outline: 'none'
            }}
            placeholder="Start Date"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: 'white',
              outline: 'none'
            }}
            placeholder="End Date"
          />

          <button
            onClick={() => {
              // Export functionality would go here
              alert('Export functionality coming soon!')
            }}
            style={{
              padding: '0.75rem 1rem',
              background: 'linear-gradient(to right, #2563eb, #4f46e5)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '500'
            }}
          >
            <Download style={{height: '1rem', width: '1rem'}} />
            Export
          </button>
        </div>

        {/* Content */}
        <div>
          {renderReportContent()}
        </div>
      </div>
    </div>
  )
}
