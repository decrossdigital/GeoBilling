"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { 
  Settings, Building, Save, Music, Mail, Phone, Globe, MapPin, CheckCircle, AlertCircle, Percent, MessageSquare, Briefcase, Plus, X, Palette, FileText, ChevronDown, ChevronUp, DollarSign
} from "lucide-react"
import Navigation from "@/components/navigation"
import Link from "next/link"
import Header from "@/components/header"

interface CompanySettings {
  name: string
  email: string
  phone: string
  address: string
  website: string
  description: string
  industry: string
  taxId: string
  taxRate: number
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
    taxId: "12-3456789",
    taxRate: 8
  })

  const [siteBranding, setSiteBranding] = useState({
    logoIcon: "Music",
    title: "GeoBilling",
    tagline: "Uniquitous Music - Professional Billing System"
  })

  const [emailTemplates, setEmailTemplates] = useState({
    quoteSubject: "Quote {{quoteNumber}} - {{project}}",
    quoteBody: "Dear {{clientName}},\n\nThank you for your interest in our services. We're pleased to present our quote for \"{{project}}\".\n\nQUOTE DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nQuote Number: {{quoteNumber}}\nValid Until: {{validUntil}}\nTotal Amount: ${{total}}\n\n{{servicesSection}}\n\n{{contractorsSection}}\n\nNOTES\n{{notes}}\n\nTERMS & CONDITIONS\n{{terms}}\n\nFor complete Terms & Conditions, please visit: {{termsUrl}}\n\nYou can view the complete quote, request modifications or accept it online at:\n{{approvalUrl}}\n\nIf you have any questions about this quote, please contact us at:\n{{companyEmail}} | {{companyPhone}}\n\nBest regards,\n{{companyName}}",
    invoiceSubject: "Invoice {{invoiceNumber}} - Payment Due - {{companyName}}",
    invoiceBody: "Dear {{clientName}},\n\nYour invoice is ready for payment. Please review the details below and complete your payment by the due date.\n\nINVOICE DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nInvoice Number: {{invoiceNumber}}\nProject: {{project}}\nTotal Amount: ${{total}}\nDue Date: {{dueDate}}\nBalance Due: ${{balanceDue}}\n\n{{paymentHistory}}\n\nYou can view and pay your invoice online at:\n{{invoiceUrl}}\n\nTERMS & CONDITIONS\n{{terms}}\n\nFor complete Terms & Conditions, please visit: {{termsUrl}}\n\nIf you have any questions about this invoice, please contact us at:\n{{companyEmail}} | {{companyPhone}}\n\nThank you for your business!\n{{companyName}}",
    clientEmailSubject: "Message from {{companyName}}",
    clientEmailBody: "Dear {{clientName}},\n\n{{message}}\n\nIf you have any questions or need to discuss this further, please don't hesitate to reach out to us at {{companyEmail}} or call {{companyPhone}}.\n\nBest regards,\n{{companyName}}"
  })

  const [expandedSections, setExpandedSections] = useState({
    branding: false,
    company: false,
    tax: false,
    emailTemplates: false,
    skills: false
  })

  const DEFAULT_SKILLS = [
    'Vocals', 'Guitar', 'Bass', 'Piano', 'Keyboard', 'Organ',
    'Drums', 'Percussion', 'Saxophone', 'Trumpet', 'Violin',
    'Mixing', 'Mastering', 'Production', 'Recording Engineer',
    'Sound Design', 'Songwriting', 'Arranging', 'Audio Editing'
  ]

  const [availableSkills, setAvailableSkills] = useState<string[]>(DEFAULT_SKILLS)
  const [newSkill, setNewSkill] = useState('')
  const [savedStatus, setSavedStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('emailTemplates')
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates)
        setEmailTemplates(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to load email templates:', error)
      }
    }

    const savedBranding = localStorage.getItem('siteBranding')
    if (savedBranding) {
      try {
        setSiteBranding(JSON.parse(savedBranding))
      } catch (error) {
        console.error('Failed to load site branding:', error)
      }
    }

    const savedSkills = localStorage.getItem('availableSkills')
    if (savedSkills) {
      try {
        setAvailableSkills(JSON.parse(savedSkills))
      } catch (error) {
        console.error('Failed to load skills:', error)
      }
    } else {
      // First time - save default skills to localStorage
      localStorage.setItem('availableSkills', JSON.stringify(DEFAULT_SKILLS))
    }
  }, [])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleSave = async () => {
    setSavedStatus("saving")
    try {
      // Save all settings to localStorage
      localStorage.setItem('emailTemplates', JSON.stringify(emailTemplates))
      localStorage.setItem('siteBranding', JSON.stringify(siteBranding))
      localStorage.setItem('availableSkills', JSON.stringify(availableSkills))
      
      // Dispatch custom event to update headers across all pages
      window.dispatchEvent(new Event('siteBrandingUpdated'))
      
      // In a real app, this would also save company settings to the database
      await new Promise(resolve => setTimeout(resolve, 500))
      setSavedStatus("success")
      setTimeout(() => setSavedStatus("idle"), 3000)
    } catch (error) {
      setSavedStatus("error")
      setTimeout(() => setSavedStatus("idle"), 3000)
    }
  }

  // Available icon options for logo
  const iconOptions = [
    { name: 'Music', icon: Music },
    { name: 'FileText', icon: FileText },
    { name: 'Building', icon: Building },
    { name: 'Settings', icon: Settings },
    { name: 'DollarSign', icon: DollarSign },
  ]

  const getIconComponent = (iconName: string) => {
    const option = iconOptions.find(opt => opt.name === iconName)
    return option ? option.icon : Music
  }

  const LogoIcon = getIconComponent(siteBranding.logoIcon)

  const handleAddSkill = () => {
    if (newSkill.trim() && !availableSkills.includes(newSkill.trim())) {
      setAvailableSkills([...availableSkills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setAvailableSkills(availableSkills.filter(s => s !== skill))
  }

  const updateField = (field: keyof CompanySettings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0f172a 100%)', color: 'white'}}>
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem'}}>
        {/* Header */}
        <Header />

        {/* Navigation */}
        <Navigation />

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

        {/* Site Branding Section */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem'}}>
          <button
            onClick={() => toggleSection('branding')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginBottom: expandedSections.branding ? '1.5rem' : 0
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Palette style={{height: '1.5rem', width: '1.5rem', color: '#a78bfa'}} />
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0}}>Site Branding</h2>
            </div>
            {expandedSections.branding ? (
              <ChevronUp style={{height: '1.25rem', width: '1.25rem', color: '#a78bfa'}} />
            ) : (
              <ChevronDown style={{height: '1.25rem', width: '1.25rem', color: '#a78bfa'}} />
            )}
          </button>

          {expandedSections.branding && (
            <div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem'}}>
                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Logo Icon</label>
                  <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                    {iconOptions.map(option => {
                      const IconComponent = option.icon
                      const isSelected = siteBranding.logoIcon === option.name
                      return (
                        <button
                          key={option.name}
                          onClick={() => setSiteBranding({...siteBranding, logoIcon: option.name})}
                          style={{
                            padding: '0.75rem',
                            backgroundColor: isSelected ? 'rgba(147, 51, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                            border: isSelected ? '2px solid #4f46e5' : '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.5rem',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={option.name}
                        >
                          <IconComponent style={{height: '1.5rem', width: '1.5rem'}} />
                        </button>
                      )
                    })}
                  </div>
                  <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem'}}>
                    Selected: {siteBranding.logoIcon}
                  </p>
                </div>

                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Site Title</label>
                  <input
                    type="text"
                    value={siteBranding.title}
                    onChange={(e) => setSiteBranding({...siteBranding, title: e.target.value})}
                    style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                    placeholder="Enter site title"
                  />
                  <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem'}}>
                    This appears in the header on all pages
                  </p>
                </div>

                <div>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Tagline</label>
                  <input
                    type="text"
                    value={siteBranding.tagline}
                    onChange={(e) => setSiteBranding({...siteBranding, tagline: e.target.value})}
                    style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                    placeholder="Enter tagline"
                  />
                  <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem'}}>
                    This appears below the title in the header
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <p style={{fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem'}}>Preview:</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <div style={{padding: '0.75rem', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', borderRadius: '1rem'}}>
                    <LogoIcon style={{height: '2rem', width: '2rem', color: 'white'}} />
                  </div>
                  <div>
                    <h1 style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white', margin: 0}}>{siteBranding.title}</h1>
                    <p style={{fontSize: '0.875rem', color: '#cbd5e1', margin: 0}}>{siteBranding.tagline}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Company Information Section */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem'}}>
          <button
            onClick={() => toggleSection('company')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginBottom: expandedSections.company ? '1.5rem' : 0
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Building style={{height: '1.5rem', width: '1.5rem', color: '#a78bfa'}} />
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0}}>Company Information</h2>
            </div>
            {expandedSections.company ? (
              <ChevronUp style={{height: '1.25rem', width: '1.25rem', color: '#a78bfa'}} />
            ) : (
              <ChevronDown style={{height: '1.25rem', width: '1.25rem', color: '#a78bfa'}} />
            )}
          </button>

          {expandedSections.company && (
            <div>
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
          )}
        </div>

        {/* Email Templates Section */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem'}}>
          <button
            onClick={() => toggleSection('emailTemplates')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginBottom: expandedSections.emailTemplates ? '1.5rem' : 0
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <MessageSquare style={{height: '1.5rem', width: '1.5rem', color: '#a78bfa'}} />
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0}}>Email Templates</h2>
            </div>
            {expandedSections.emailTemplates ? (
              <ChevronUp style={{height: '1.25rem', width: '1.25rem', color: '#a78bfa'}} />
            ) : (
              <ChevronDown style={{height: '1.25rem', width: '1.25rem', color: '#a78bfa'}} />
            )}
          </button>

          {expandedSections.emailTemplates && (
            <div>
              {/* Quote Email Template */}
              <div style={{marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
                <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '1rem'}}>Quote Email Template</h3>

                <div style={{marginBottom: '1rem'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Email Subject</label>
                  <input
                    type="text"
                    value={emailTemplates.quoteSubject}
                    onChange={(e) => setEmailTemplates({...emailTemplates, quoteSubject: e.target.value})}
                    style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                    placeholder="Enter email subject template..."
                  />
                </div>

                <div style={{marginBottom: '1rem'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Email Body</label>
                  <textarea
                    value={emailTemplates.quoteBody}
                    onChange={(e) => setEmailTemplates({...emailTemplates, quoteBody: e.target.value})}
                    rows={12}
                    style={{width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: '1.5'}}
                    placeholder="Enter email body template..."
                  />
                </div>

                <details style={{marginBottom: '1rem'}}>
                  <summary style={{cursor: 'pointer', color: '#a78bfa', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem'}}>
                    📋 Available Merge Fields (click to expand)
                  </summary>
                  <div style={{backgroundColor: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(147, 51, 234, 0.2)', borderRadius: '0.5rem', padding: '1rem', marginTop: '0.5rem'}}>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace'}}>
                      <div><span style={{color: '#fbbf24'}}>{'{{clientName}}'}</span> <span style={{color: '#94a3b8'}}>- Client full name</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{clientFirstName}}'}</span> <span style={{color: '#94a3b8'}}>- First name</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{clientLastName}}'}</span> <span style={{color: '#94a3b8'}}>- Last name</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{clientEmail}}'}</span> <span style={{color: '#94a3b8'}}>- Email</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{clientPhone}}'}</span> <span style={{color: '#94a3b8'}}>- Phone</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{clientAddress}}'}</span> <span style={{color: '#94a3b8'}}>- Address</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{clientCompany}}'}</span> <span style={{color: '#94a3b8'}}>- Company</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{quoteNumber}}'}</span> <span style={{color: '#94a3b8'}}>- Quote number</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{project}}'}</span> <span style={{color: '#94a3b8'}}>- Project name</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{projectDescription}}'}</span> <span style={{color: '#94a3b8'}}>- Project desc</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{total}}'}</span> <span style={{color: '#94a3b8'}}>- Total amount</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{validUntil}}'}</span> <span style={{color: '#94a3b8'}}>- Valid until date</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{notes}}'}</span> <span style={{color: '#94a3b8'}}>- Quote notes</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{terms}}'}</span> <span style={{color: '#94a3b8'}}>- Terms & conditions</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{servicesSection}}'}</span> <span style={{color: '#94a3b8'}}>- Services list</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{contractorsSection}}'}</span> <span style={{color: '#94a3b8'}}>- Contractors list</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{quoteUrl}}'}</span> <span style={{color: '#94a3b8'}}>- View quote link</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{approvalUrl}}'}</span> <span style={{color: '#94a3b8'}}>- Approval link</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{termsUrl}}'}</span> <span style={{color: '#94a3b8'}}>- Terms page link</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{companyName}}'}</span> <span style={{color: '#94a3b8'}}>- Your company</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{companyEmail}}'}</span> <span style={{color: '#94a3b8'}}>- Your email</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{companyPhone}}'}</span> <span style={{color: '#94a3b8'}}>- Your phone</span></div>
                    </div>
                  </div>
                </details>
              </div>

              {/* Invoice Email Template */}
              <div style={{marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
                <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '1rem'}}>Invoice Email Template</h3>

                <div style={{marginBottom: '1rem'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Email Subject</label>
                  <input
                    type="text"
                    value={emailTemplates.invoiceSubject}
                    onChange={(e) => setEmailTemplates({...emailTemplates, invoiceSubject: e.target.value})}
                    style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                    placeholder="Enter email subject template..."
                  />
                </div>

                <div style={{marginBottom: '1rem'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Email Body</label>
                  <textarea
                    value={emailTemplates.invoiceBody}
                    onChange={(e) => setEmailTemplates({...emailTemplates, invoiceBody: e.target.value})}
                    rows={12}
                    style={{width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: '1.5'}}
                    placeholder="Enter email body template..."
                  />
                </div>

                <details style={{marginBottom: '1rem'}}>
                  <summary style={{cursor: 'pointer', color: '#a78bfa', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem'}}>
                    📋 Available Merge Fields (click to expand)
                  </summary>
                  <div style={{backgroundColor: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(147, 51, 234, 0.2)', borderRadius: '0.5rem', padding: '1rem', marginTop: '0.5rem'}}>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace'}}>
                      <div><span style={{color: '#fbbf24'}}>{'{{clientName}}'}</span> <span style={{color: '#94a3b8'}}>- Client full name</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{clientEmail}}'}</span> <span style={{color: '#94a3b8'}}>- Email</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{invoiceNumber}}'}</span> <span style={{color: '#94a3b8'}}>- Invoice number</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{project}}'}</span> <span style={{color: '#94a3b8'}}>- Project name</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{total}}'}</span> <span style={{color: '#94a3b8'}}>- Total amount</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{dueDate}}'}</span> <span style={{color: '#94a3b8'}}>- Due date</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{balanceDue}}'}</span> <span style={{color: '#94a3b8'}}>- Balance due</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{paymentHistory}}'}</span> <span style={{color: '#94a3b8'}}>- Payment history section</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{invoiceUrl}}'}</span> <span style={{color: '#94a3b8'}}>- View invoice link</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{terms}}'}</span> <span style={{color: '#94a3b8'}}>- Terms & conditions</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{termsUrl}}'}</span> <span style={{color: '#94a3b8'}}>- Terms page link</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{companyName}}'}</span> <span style={{color: '#94a3b8'}}>- Your company</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{companyEmail}}'}</span> <span style={{color: '#94a3b8'}}>- Your email</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{companyPhone}}'}</span> <span style={{color: '#94a3b8'}}>- Your phone</span></div>
                    </div>
                  </div>
                </details>
              </div>

              {/* Generic Client Email Template */}
              <div>
                <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '1rem'}}>Generic Client Email Template</h3>

                <div style={{marginBottom: '1rem'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Email Subject</label>
                  <input
                    type="text"
                    value={emailTemplates.clientEmailSubject}
                    onChange={(e) => setEmailTemplates({...emailTemplates, clientEmailSubject: e.target.value})}
                    style={{width: '100%', padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                    placeholder="Enter email subject template..."
                  />
                </div>

                <div style={{marginBottom: '1rem'}}>
                  <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Email Body Template</label>
                  <textarea
                    value={emailTemplates.clientEmailBody}
                    onChange={(e) => setEmailTemplates({...emailTemplates, clientEmailBody: e.target.value})}
                    rows={10}
                    style={{width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: '1.5'}}
                    placeholder="Enter email body template..."
                  />
                  <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem'}}>
                    Note: The <code style={{color: '#fbbf24'}}>{'{{message}}'}</code> field will be replaced with the custom message you type when sending the email.
                  </p>
                </div>

                <details style={{marginBottom: '1rem'}}>
                  <summary style={{cursor: 'pointer', color: '#a78bfa', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem'}}>
                    📋 Available Merge Fields (click to expand)
                  </summary>
                  <div style={{backgroundColor: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(147, 51, 234, 0.2)', borderRadius: '0.5rem', padding: '1rem', marginTop: '0.5rem'}}>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace'}}>
                      <div><span style={{color: '#fbbf24'}}>{'{{clientName}}'}</span> <span style={{color: '#94a3b8'}}>- Client full name</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{clientEmail}}'}</span> <span style={{color: '#94a3b8'}}>- Email</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{message}}'}</span> <span style={{color: '#94a3b8'}}>- Custom message (typed when sending)</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{companyName}}'}</span> <span style={{color: '#94a3b8'}}>- Your company</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{companyEmail}}'}</span> <span style={{color: '#94a3b8'}}>- Your email</span></div>
                      <div><span style={{color: '#fbbf24'}}>{'{{companyPhone}}'}</span> <span style={{color: '#94a3b8'}}>- Your phone</span></div>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>

        {/* Contractor Skills Section */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem'}}>
          <button
            onClick={() => toggleSection('skills')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginBottom: expandedSections.skills ? '1.5rem' : 0
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Briefcase style={{height: '1.5rem', width: '1.5rem', color: '#a78bfa'}} />
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0}}>Contractor Skills</h2>
            </div>
            {expandedSections.skills ? (
              <ChevronUp style={{height: '1.25rem', width: '1.25rem', color: '#a78bfa'}} />
            ) : (
              <ChevronDown style={{height: '1.25rem', width: '1.25rem', color: '#a78bfa'}} />
            )}
          </button>

          {expandedSections.skills && (
            <div>

          <p style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '1rem'}}>
            Manage the available skills for contractors. These skills will be used to filter and assign contractors to quotes.
          </p>

          {/* Add New Skill */}
          <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem'}}>
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              style={{flex: 1, padding: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
              placeholder="Enter new skill..."
            />
            <button
              onClick={handleAddSkill}
              disabled={!newSkill.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: newSkill.trim() ? 'linear-gradient(to right, #10b981, #059669)' : 'rgba(255, 255, 255, 0.1)',
                color: newSkill.trim() ? 'white' : '#94a3b8',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: newSkill.trim() ? 'pointer' : 'not-allowed',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              <Plus style={{height: '1rem', width: '1rem'}} />
              Add
            </button>
          </div>

          {/* Skills Grid */}
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
            {availableSkills.map(skill => (
              <div
                key={skill}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'rgba(147, 51, 234, 0.2)',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  color: '#e9d5ff'
                }}
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    color: '#e9d5ff',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  title={`Remove ${skill}`}
                >
                  <X style={{height: '0.875rem', width: '0.875rem'}} />
                </button>
              </div>
            ))}
          </div>

          {availableSkills.length === 0 && (
            <p style={{fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '1rem'}}>
              No skills added yet. Add your first skill above.
            </p>
          )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
