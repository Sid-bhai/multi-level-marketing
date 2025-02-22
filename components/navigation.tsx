"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Wallet, Settings, LogOut } from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Network", href: "/network", icon: Users },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="w-64 bg-card text-card-foreground p-4 space-y-4 border-r border-border">
      <div className="text-2xl font-bold text-primary mb-8">MLM Platform</div>
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
            pathname === item.href
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
        </Link>
      ))}
      <button className="flex items-center space-x-3 p-2 rounded-lg text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors w-full mt-auto">
        <LogOut className="h-5 w-5" />
        <span>Log Out</span>
      </button>
    </nav>
  )
}

