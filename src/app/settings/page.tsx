"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { 
  Settings, Building, Save, Music, Mail, Phone, Globe, MapPin, CheckCircle, AlertCircle, Percent, MessageSquare, Briefcase, Plus, X
} from "lucide-react"
import Navigation from "@/components/navigation"
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

  const [emailTemplates, setEmailTemplates] = useState({
    quoteSubject: "Quote {{quoteNumber}} - {{project}}",
    quoteBody: "Dear {{clientName}},\n\nThank you for your interest in our services. We're pleased to present our quote for \"{{project}}\".\n\nQUOTE DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nQuote Number: {{quoteNumber}}\nValid Until: {{validUntil}}\nTotal Amount: ${{total}}\n\n{{servicesSection}}\n\n{{contractorsSection}}\n\nNOTES\n{{notes}}\n\nTERMS & CONDITIONS\n{{terms}}\n\nYou can view the complete quote details and accept online at:\n{{quoteUrl}}\n\nIf you have any questions about this quote, please contact us at:\n{{companyEmail}} | {{companyPhone}}\n\nBest regards,\n{{companyName}}"
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

  // Load email templates and skills from localStorage on mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('emailTemplates')
    if (savedTemplates) {
      try {
        setEmailTemplates(JSON.parse(savedTemplates))
      } catch (error) {
        console.error('Failed to load email templates:', error)
      }
    }

    const savedSkills = localStorage.getItem('availableSkills')
    if (savedSkills) {
      try {
        setAvailableSkills(JSON.parse(savedSkills))
      } catch (error) {
        console.error('Failed to load skills:', error)
      }
    }
  }, [])

  const handleSave = async () => {
    setSavedStatus("saving")
    try {
      // Save email templates and skills to localStorage
      localStorage.setItem('emailTemplates', JSON.stringify(emailTemplates))
      localStorage.setItem('availableSkills', JSON.stringify(availableSkills))
      
      // In a real app, this would also save company settings to the database
      await new Promise(resolve => setTimeout(resolve, 500))
      setSavedStatus("success")
      setTimeout(() => setSavedStatus("idle"), 3000)
    } catch (error) {
      setSavedStatus("error")
      setTimeout(() => setSavedStatus("idle"), 3000)
    }
  }

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
          <UserMenu />
        </div>

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

        {/* Tax Settings */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', marginTop: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
            <Percent style={{height: '1.5rem', width: '1.5rem', color: '#a78bfa'}} />
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white'}}>Tax Settings</h2>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
            <div>
              <label style={{fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'block'}}>Default Tax Rate (%)</label>
              <div style={{position: 'relative'}}>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
                  style={{width: '100%', padding: '0.5rem 2.5rem 0.5rem 0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.25rem', color: 'white', outline: 'none'}}
                  placeholder="Enter tax rate"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <div style={{position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1', fontSize: '0.875rem'}}>%</div>
              </div>
              <p style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem'}}>
                This rate will be applied to taxable items in quotes and invoices
              </p>
            </div>
          </div>
        </div>

        {/* Skills Management */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', marginTop: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
            <Briefcase style={{height: '1.5rem', width: '1.5rem', color: '#a78bfa'}} />
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white'}}>Contractor Skills</h2>
          </div>

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

        {/* Email Templates */}
        <div style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', marginTop: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
            <MessageSquare style={{height: '1.5rem', width: '1.5rem', color: '#a78bfa'}} />
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white'}}>Quote Email Template</h2>
          </div>

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
              rows={15}
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
                <div><span style={{color: '#fbbf24'}}>{'{{companyName}}'}</span> <span style={{color: '#94a3b8'}}>- Your company</span></div>
                <div><span style={{color: '#fbbf24'}}>{'{{companyEmail}}'}</span> <span style={{color: '#94a3b8'}}>- Your email</span></div>
                <div><span style={{color: '#fbbf24'}}>{'{{companyPhone}}'}</span> <span style={{color: '#94a3b8'}}>- Your phone</span></div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
