'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Music, FileText, Building, Settings, DollarSign } from 'lucide-react'
import UserMenu from './user-menu'

interface SiteBranding {
  logoIcon: string
  title: string
  tagline: string
}

const DEFAULT_BRANDING: SiteBranding = {
  logoIcon: 'Music',
  title: 'GeoBilling',
  tagline: 'Uniquitous Music - Professional Billing System'
}

const iconMap: Record<string, typeof Music> = {
  Music,
  FileText,
  Building,
  Settings,
  DollarSign,
}

export default function Header() {
  const { data: session } = useSession()
  const [branding, setBranding] = useState<SiteBranding>(DEFAULT_BRANDING)

  useEffect(() => {
    // Load branding from localStorage
    const loadBranding = () => {
      try {
        const saved = localStorage.getItem('siteBranding')
        if (saved) {
          const parsed = JSON.parse(saved)
          setBranding({ ...DEFAULT_BRANDING, ...parsed })
        }
      } catch (error) {
        console.error('Failed to load site branding:', error)
      }
    }

    loadBranding()

    // Listen for storage changes (when settings are updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'siteBranding') {
        loadBranding()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Also listen for custom event for same-tab updates
    const handleCustomStorageChange = () => {
      loadBranding()
    }

    window.addEventListener('siteBrandingUpdated', handleCustomStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('siteBrandingUpdated', handleCustomStorageChange)
    }
  }, [])

  const IconComponent = iconMap[branding.logoIcon] || Music

  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
        <div style={{padding: '0.75rem', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', borderRadius: '1rem'}}>
          <IconComponent style={{height: '2rem', width: '2rem', color: 'white'}} />
        </div>
        <div>
          <h1 style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'white'}}>{branding.title}</h1>
          <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>{branding.tagline}</p>
        </div>
      </div>
      {session && <UserMenu />}
    </div>
  )
}

