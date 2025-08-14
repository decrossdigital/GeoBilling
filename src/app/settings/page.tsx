"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { 
  Settings, Building, Save, Music, Home, FileText, DollarSign, Users,
  Mail, Phone, Globe, MapPin, CheckCircle, AlertCircle, Info
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Music style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>GeoBilling</h1>
              <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: 0 }}>Uniquitous Music - Professional Billing System</p>
            </div>
          </div>
          <UserMenu />
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '0.5rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              <Home style={{ width: '16px', height: '16px' }} />
              Dashboard
            </Link>
            <Link href="/clients" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              <Users style={{ width: '16px', height: '16px' }} />
              Clients
            </Link>
            <Link href="/quotes" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              <FileText style={{ width: '16px', height: '16px' }} />
              Quotes
            </Link>
            <Link href="/invoices" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              <DollarSign style={{ width: '16px', height: '16px' }} />
              Invoices
            </Link>
            <Link href="/analytics" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              <FileText style={{ width: '16px', height: '16px' }} />
              Analytics
            </Link>
            <Link href="/reports" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
              <FileText style={{ width: '16px', height: '16px' }} />
              Reports
            </Link>
            <Link href="/settings" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              <Settings style={{ width: '16px', height: '16px' }} />
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px'
            }}>
              <Building style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Company Settings</h2>
              <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: '0.25rem 0 0 0' }}>
                Manage your company information and business details
              </p>
            </div>
          </div>

          {/* Company Information Form */}
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Website
                </label>
                <input
                  type="url"
                  value={settings.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter website URL"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Industry
                </label>
                <input
                  type="text"
                  value={settings.industry}
                  onChange={(e) => updateField('industry', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter industry"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Tax ID
                </label>
                <input
                  type="text"
                  value={settings.taxId}
                  onChange={(e) => updateField('taxId', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter tax ID"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Address
              </label>
              <textarea
                value={settings.address}
                onChange={(e) => updateField('address', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
                placeholder="Enter company address"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Company Description
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
                placeholder="Enter company description"
              />
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={handleSave}
                disabled={savedStatus === "saving"}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  background: savedStatus === "success" 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : savedStatus === "error"
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: savedStatus === "saving" ? 'not-allowed' : 'pointer',
                  opacity: savedStatus === "saving" ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {savedStatus === "saving" && <div style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
                {savedStatus === "success" && <CheckCircle style={{ width: '16px', height: '16px' }} />}
                {savedStatus === "error" && <AlertCircle style={{ width: '16px', height: '16px' }} />}
                {savedStatus === "idle" && <Save style={{ width: '16px', height: '16px' }} />}
                {savedStatus === "saving" ? "Saving..." : 
                 savedStatus === "success" ? "Saved!" : 
                 savedStatus === "error" ? "Error" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Configuration Notice */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Info style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Configuration Notice</span>
            </div>
            <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: 0 }}>
              OAuth credentials, API keys, and other sensitive configuration are managed through environment variables 
              in your hosting platform (Render.com). These settings are not editable through this interface for security reasons.
            </p>
          </div>
        </div>
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
