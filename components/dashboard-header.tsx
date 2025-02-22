"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Wallet, Settings, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Network", href: "/dashboard/network", icon: Users },
  { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
            pathname === item.href
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
          onClick={() => setIsOpen(false)}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
        </Link>
      ))}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-3 p-2 rounded-lg text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors w-full mt-auto"
      >
        <LogOut className="h-5 w-5" />
        <span>Log Out</span>
      </button>
    </>
  )

  return (
    <header className="border-b">
      <div className="flex items-center h-16 px-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4">
            <div className="flex flex-col h-full">
              <div className="text-2xl font-bold text-primary mb-8">MLM Platform</div>
              <nav className="flex flex-col flex-1 gap-2">
                <NavLinks />
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <div className="hidden lg:flex items-center gap-6 mx-6">
          <div className="text-2xl font-bold text-primary">MLM Platform</div>
          <nav className="flex items-center space-x-4">
            <NavLinks />
          </nav>
        </div>
      </div>
    </header>
  )
}

