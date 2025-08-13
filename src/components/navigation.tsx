"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, FileText, DollarSign, BarChart3, Settings } from "lucide-react"
import UserMenu from "./user-menu"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/quotes", label: "Quotes", icon: FileText },
    { href: "/invoices", label: "Invoices", icon: DollarSign },
    { href: "/contractors", label: "Contractors", icon: Users },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
        
        <UserMenu />
      </div>
    </div>
  )
}
