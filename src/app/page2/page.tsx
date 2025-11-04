"use client"

import Link from "next/link"
import {
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  Music,
  BarChart3,
  Plus,
  ArrowUpRight,
  Home
} from "lucide-react"

export default function Dashboard2() {
  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0f172a 100%)', color: 'white'}}>
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
              <Link href="/page2" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'linear-gradient(to right, #9333ea, #3b82f6)', color: 'white', textDecoration: 'none', fontWeight: '500', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}>
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
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                  alt="User" 
                  style={{width: '2rem', height: '2rem', borderRadius: '50%'}} 
                />
                <span style={{fontSize: '0.875rem', fontWeight: '500'}}>John Doe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem'}}>
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem'}}>Total Revenue</p>
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>$24,580</p>
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
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>8</p>
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
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>12</p>
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
                <p style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>24</p>
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

            <Link href="/clients/new" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', textDecoration: 'none', display: 'block'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #9333ea, #ec4899)', borderRadius: '0.75rem'}}>
                  <Users style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
                </div>
                <ArrowUpRight style={{height: '1.25rem', width: '1.25rem', color: '#94a3b8'}} />
              </div>
              <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '0.5rem'}}>Add Client</h3>
              <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>Add a new client to your database</p>
            </Link>

            <Link href="/analytics" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', textDecoration: 'none', display: 'block'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                <div style={{padding: '0.75rem', background: 'linear-gradient(to right, #4f46e5, #8b5cf6)', borderRadius: '0.75rem'}}>
                  <BarChart3 style={{height: '1.5rem', width: '1.5rem', color: 'white'}} />
                </div>
                <ArrowUpRight style={{height: '1.25rem', width: '1.25rem', color: '#94a3b8'}} />
              </div>
              <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: 'white', marginBottom: '0.5rem'}}>Analytics</h3>
              <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>View business insights and metrics</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
