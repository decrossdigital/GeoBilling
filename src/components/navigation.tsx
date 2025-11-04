'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  FileText, 
  DollarSign, 
  Tag, 
  User, 
  BarChart3, 
  Settings, 
  Menu, 
  X 
} from 'lucide-react'
import UserMenu from './user-menu'

interface NavigationProps {
  className?: string
}

export default function Navigation({ className = '' }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Check if navigation items would overflow
  useEffect(() => {
    const checkOverflow = () => {
      if (navRef.current) {
        const navContainer = navRef.current
        const navItems = navContainer.querySelector('.nav-items') as HTMLElement
        if (navItems) {
          const containerWidth = navContainer.offsetWidth
          const itemsWidth = navItems.scrollWidth
          // Add some buffer (100px) to account for padding and hamburger button
          setIsMobile(itemsWidth > containerWidth - 100)
        }
      }
    }
    
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      const mobileMenu = document.querySelector('.mobile-menu')
      const hamburgerButton = document.querySelector('.hamburger-button')
      
      if (mobileMenu && !mobileMenu.contains(target) && !hamburgerButton?.contains(target)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  const navItems = [
    { href: '/', icon: Home, label: 'Dashboard', active: pathname === '/' },
    { href: '/clients', icon: Users, label: 'Clients', active: pathname === '/clients' },
    { href: '/quotes', icon: FileText, label: 'Quotes', active: pathname === '/quotes' },
    { href: '/invoices', icon: DollarSign, label: 'Invoices', active: pathname === '/invoices' },
    { href: '/services', icon: Tag, label: 'Services', active: pathname === '/services' },
    { href: '/contractors', icon: User, label: 'Contractors', active: pathname === '/contractors' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics', active: pathname === '/analytics' },
    { href: '/settings', icon: Settings, label: 'Settings', active: pathname === '/settings' },
  ]

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const Icon = item.icon
    return (
      <Link 
        href={item.href} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          color: item.active ? 'white' : '#cbd5e1',
          textDecoration: 'none',
          fontWeight: '500',
          background: item.active ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : 'transparent',
          boxShadow: item.active ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
          transition: 'all 0.2s'
        }}
      >
        <Icon style={{height: '1rem', width: '1rem'}} />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div 
        ref={navRef}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '2rem',
          position: 'relative',
          zIndex: 1000
        }} 
        className={className}
      >
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          {/* Mobile Hamburger Button */}
          {isMobile && (
            <button
              className="hamburger-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isMobileMenuOpen ? (
                <X style={{height: '1.25rem', width: '1.25rem'}} />
              ) : (
                <Menu style={{height: '1.25rem', width: '1.25rem'}} />
              )}
            </button>
          )}

          {/* Desktop Nav Items */}
          <div className="nav-items" style={{display: 'flex', gap: '0.5rem', visibility: isMobile ? 'hidden' : 'visible'}}>
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '6rem'
          }}
        >
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '1rem',
            padding: '1.5rem',
            width: '90%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div>
                <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
                  Navigation
                </h3>
                <p style={{fontSize: '0.875rem', color: '#cbd5e1'}}>
                  Select a page to navigate
                </p>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <X style={{height: '1.25rem', width: '1.25rem'}} />
              </button>
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    color: item.active ? 'white' : '#cbd5e1',
                    textDecoration: 'none',
                    fontWeight: '500',
                    backgroundColor: item.active ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: item.active ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s'
                  }}
                >
                  <item.icon style={{height: '1.25rem', width: '1.25rem'}} />
                  <span style={{fontSize: '1rem'}}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
