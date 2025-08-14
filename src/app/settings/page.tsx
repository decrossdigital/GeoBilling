"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { 
  Settings, Building, Save, Music, Home, FileText, DollarSign, Users,
  Mail, Phone, Globe, MapPin, CheckCircle, AlertCircle, User, BarChart3
} from "lucide-react"
import Link from "next/link"
import UserMenu from "@/components/user-menu"

interface CompanySettings {
  name: string
  email: string
  phone: string
  address: string
  website: string
  description: string
  industry: string
  taxId: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<CompanySettings>({
    name: "Uniquitous Music",
    email: "george@uniquitousmusic.com",
    phone: "(609) 316-8080",
    address: "123 Music Studio Lane, NJ 08540",
    website: "https://uniquitousmusic.com",
    description: "Professional music production and audio engineering services",
    industry: "Music Production & Audio Engineering",
    taxId: "12-3456789"
  })

  const [savedStatus, setSavedStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

  const handleSave = async () => {
    setSavedStatus("saving")
    try {
      // In a real app, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSavedStatus("success")
      setTimeout(() => setSavedStatus("idle"), 3000)
    } catch (error) {
      setSavedStatus("error")
      setTimeout(() => setSavedStatus("idle"), 3000)
    }
  }

  const updateField = (field: keyof CompanySettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
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
              <Link href="/reports" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#cbd5e1', textDecoration: 'none', fontWeight: '500'}}>
                <BarChart3 style={{height: '1rem', width: '1rem'}} />
                <span>Reports</span>
              </Link>
              <Link href="/settings" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'linear-gradient(to right, #9333ea, #3b82f6)', color: 'white', textDecoration: 'none', fontWeight: '500', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}>
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
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
            <div>
              <h1 style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white'}}>Settings</h1>
              <p style={{color: '#cbd5e1'}}>Manage your company information and business details</p>
            </div>
            <button
              onClick={handleSave}
              disabled={savedStatus === "saving"}
              style={{
                padding: '0.75rem 1.5rem',
                background: savedStatus === "success" ? 'linear-gradient(to right, #059669, #0d9488)' : 'linear-gradient(to right, #2563eb, #4f46e5)',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: savedStatus === "saving" ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: savedStatus === "saving" ? 0.7 : 1
              }}
            >
              {savedStatus === "saving" ? (
                <>Saving...</>
              ) : savedStatus === "success" ? (
                <>
                  <CheckCircle style={{height: '1rem', width: '1rem'}} />
                  Saved
                </>
              ) : (
                <>
                  <Save style={{height: '1rem', width: '1rem'}} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Settings Form */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
            <Building style={{height: '1.5rem', width: '1.5rem', color: '#a78bfa'}} />
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white'}}>Company Information</h2>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
            <div>
              <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Company Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => updateField('name', e.target.value)}
                style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => updateField('email', e.target.value)}
                style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Phone Number</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Website</label>
              <input
                type="url"
                value={settings.website}
                onChange={(e) => updateField('website', e.target.value)}
                style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                placeholder="Enter website URL"
              />
            </div>

            <div>
              <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Industry</label>
              <input
                type="text"
                value={settings.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                placeholder="Enter industry"
              />
            </div>

            <div>
              <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Tax ID</label>
              <input
                type="text"
                value={settings.taxId}
                onChange={(e) => updateField('taxId', e.target.value)}
                style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                placeholder="Enter tax ID"
              />
            </div>
          </div>

          <div style={{marginTop: '1rem'}}>
            <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Address</label>
            <textarea
              value={settings.address}
              onChange={(e) => updateField('address', e.target.value)}
              rows={3}
              style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', resize: 'vertical'}}
              placeholder="Enter company address"
            />
          </div>

          <div style={{marginTop: '1rem'}}>
            <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Company Description</label>
            <textarea
              value={settings.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', resize: 'vertical'}}
              placeholder="Enter company description"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
