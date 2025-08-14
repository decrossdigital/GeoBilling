"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { ChevronDown, LogOut } from "lucide-react"

export default function UserMenu() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  return (
    <div style={{position: 'relative', zIndex: 10000, overflow: 'visible'}}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          borderRadius: '0.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <img 
          src={session?.user?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"} 
          alt={session?.user?.name || "User"} 
          style={{width: '2rem', height: '2rem', borderRadius: '50%'}} 
        />
        <span style={{fontSize: '0.875rem', fontWeight: '500'}}>{session?.user?.name || "John Doe"}</span>
        <ChevronDown style={{height: '1rem', width: '1rem', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '0.5rem',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.75rem',
          padding: '0.5rem',
          minWidth: '200px',
          zIndex: 999999,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          transform: 'translateZ(0)'
        }}>
          <div style={{padding: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
            <div style={{fontSize: '0.875rem', fontWeight: '500', color: 'white'}}>{session?.user?.name || "John Doe"}</div>
            <div style={{fontSize: '0.75rem', color: '#cbd5e1'}}>{session?.user?.email || "user@example.com"}</div>
          </div>
          
          <div style={{padding: '0.25rem'}}>
            <button
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#f87171',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)'
                e.currentTarget.style.color = '#fca5a5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#f87171'
              }}
            >
              <LogOut style={{height: '1rem', width: '1rem'}} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
