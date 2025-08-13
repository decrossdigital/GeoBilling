"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { 
  Settings, Key, Shield, Mail, CreditCard, Database, 
  User, Building, Save, Eye, EyeOff, Copy, CheckCircle,
  AlertCircle, Info, Music, Home, FileText, DollarSign, Users
} from "lucide-react"
import Link from "next/link"
import UserMenu from "@/components/user-menu"

interface SettingsData {
  company: {
    name: string
    email: string
    phone: string
    address: string
    website: string
  }
  authentication: {
    googleClientId: string
    googleClientSecret: string
    nextAuthSecret: string
  }
  payments: {
    stripePublishableKey: string
    stripeSecretKey: string
    stripeWebhookSecret: string
    paypalClientId: string
    paypalClientSecret: string
    paypalMode: string
  }
  email: {
    resendApiKey: string
    fromEmail: string
  }
  database: {
    url: string
  }
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<SettingsData>({
    company: {
      name: "Uniquitous Music",
      email: "george@uniquitousmusic.com",
      phone: "(609) 316-8080",
      address: "123 Music Studio Lane, NJ 08540",
      website: "https://uniquitousmusic.com"
    },
    authentication: {
      googleClientId: "your-google-client-id",
      googleClientSecret: "your-google-client-secret",
      nextAuthSecret: "your-nextauth-secret-key-here"
    },
    payments: {
      stripePublishableKey: "pk_test_your-stripe-publishable-key",
      stripeSecretKey: "sk_test_your-stripe-secret-key",
      stripeWebhookSecret: "whsec_your-stripe-webhook-secret",
      paypalClientId: "your-paypal-client-id",
      paypalClientSecret: "your-paypal-client-secret",
      paypalMode: "sandbox"
    },
    email: {
      resendApiKey: "your-resend-api-key",
      fromEmail: "noreply@uniquitousmusic.com"
    },
    database: {
      url: "postgresql://username:password@localhost:5432/geobilling"
    }
  })

  const [showSecrets, setShowSecrets] = useState<{[key: string]: boolean}>({})
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [savedStatus, setSavedStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

  const toggleSecret = (field: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSave = async () => {
    setSavedStatus("saving")
    try {
      // In a real app, this would save to the database or environment
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSavedStatus("success")
      setTimeout(() => setSavedStatus("idle"), 3000)
    } catch (error) {
      setSavedStatus("error")
      setTimeout(() => setSavedStatus("idle"), 3000)
    }
  }

  const updateSetting = (section: keyof SettingsData, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const renderSecretField = (value: string, field: string, label: string) => (
    <div style={{marginBottom: '1rem'}}>
      <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>{label}</label>
      <div style={{display: 'flex', gap: '0.5rem'}}>
        <input
          type={showSecrets[field] ? "text" : "password"}
          value={value}
          onChange={(e) => updateSetting(field.split('.')[0] as keyof SettingsData, field.split('.')[1], e.target.value)}
          style={{flex: 1, padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
        />
        <button
          onClick={() => toggleSecret(field)}
          style={{padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', cursor: 'pointer'}}
        >
          {showSecrets[field] ? <EyeOff style={{height: '1rem', width: '1rem'}} /> : <Eye style={{height: '1rem', width: '1rem'}} />}
        </button>
        <button
          onClick={() => copyToClipboard(value, field)}
          style={{padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', cursor: 'pointer'}}
        >
          {copiedField === field ? <CheckCircle style={{height: '1rem', width: '1rem', color: '#34d399'}} /> : <Copy style={{height: '1rem', width: '1rem'}} />}
        </button>
      </div>
    </div>
  )

  const renderTextField = (value: string, field: string, label: string, type: string = "text") => (
    <div style={{marginBottom: '1rem'}}>
      <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => updateSetting(field.split('.')[0] as keyof SettingsData, field.split('.')[1], e.target.value)}
        style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
      />
    </div>
  )

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
              <p style={{color: '#cbd5e1'}}>Configure your application settings and API keys</p>
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

        {/* Settings Sections */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem'}}>
          {/* Company Information */}
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
              <Building style={{height: '1.5rem', width: '1.5rem', color: '#a78bfa'}} />
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white'}}>Company Information</h2>
            </div>
            
            {renderTextField(settings.company.name, "company.name", "Company Name")}
            {renderTextField(settings.company.email, "company.email", "Email", "email")}
            {renderTextField(settings.company.phone, "company.phone", "Phone", "tel")}
            {renderTextField(settings.company.address, "company.address", "Address")}
            {renderTextField(settings.company.website, "company.website", "Website", "url")}
          </div>

          {/* Authentication */}
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
              <Shield style={{height: '1.5rem', width: '1.5rem', color: '#a78bfa'}} />
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white'}}>Authentication</h2>
            </div>
            
            {renderSecretField(settings.authentication.googleClientId, "authentication.googleClientId", "Google Client ID")}
            {renderSecretField(settings.authentication.googleClientSecret, "authentication.googleClientSecret", "Google Client Secret")}
            {renderSecretField(settings.authentication.nextAuthSecret, "authentication.nextAuthSecret", "NextAuth Secret")}
          </div>

          {/* Payment Settings */}
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
              <CreditCard style={{height: '1.5rem', width: '1.5rem', color: '#a78bfa'}} />
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white'}}>Payment Settings</h2>
            </div>
            
            <div style={{marginBottom: '1rem'}}>
              <h3 style={{fontSize: '1rem', fontWeight: '500', color: 'white', marginBottom: '1rem'}}>Stripe</h3>
              {renderSecretField(settings.payments.stripePublishableKey, "payments.stripePublishableKey", "Publishable Key")}
              {renderSecretField(settings.payments.stripeSecretKey, "payments.stripeSecretKey", "Secret Key")}
              {renderSecretField(settings.payments.stripeWebhookSecret, "payments.stripeWebhookSecret", "Webhook Secret")}
            </div>
            
            <div>
              <h3 style={{fontSize: '1rem', fontWeight: '500', color: 'white', marginBottom: '1rem'}}>PayPal</h3>
              {renderSecretField(settings.payments.paypalClientId, "payments.paypalClientId", "Client ID")}
              {renderSecretField(settings.payments.paypalClientSecret, "payments.paypalClientSecret", "Client Secret")}
              <div style={{marginBottom: '1rem'}}>
                <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Mode</label>
                <select
                  value={settings.payments.paypalMode}
                  onChange={(e) => updateSetting("payments", "paypalMode", e.target.value)}
                  style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                >
                  <option value="sandbox">Sandbox</option>
                  <option value="live">Live</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
              <Mail style={{height: '1.5rem', width: '1.5rem', color: '#a78bfa'}} />
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white'}}>Email Settings</h2>
            </div>
            
            {renderSecretField(settings.email.resendApiKey, "email.resendApiKey", "Resend API Key")}
            {renderTextField(settings.email.fromEmail, "email.fromEmail", "From Email", "email")}
          </div>

          {/* Database Settings */}
          <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
              <Database style={{height: '1.5rem', width: '1.5rem', color: '#a78bfa'}} />
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white'}}>Database</h2>
            </div>
            
            {renderSecretField(settings.database.url, "database.url", "Database URL")}
          </div>
        </div>

        {/* Status Messages */}
        {savedStatus === "error" && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: 1000
          }}>
            <AlertCircle style={{height: '1rem', width: '1rem'}} />
            Failed to save settings
          </div>
        )}
      </div>
    </div>
  )
}
