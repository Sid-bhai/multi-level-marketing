"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { EarningsChart } from "@/components/earnings-chart"
import { RecentReferrals } from "@/components/recent-referrals"
import { ReferralNetwork } from "@/components/referral-network"
import { toast } from "@/components/ui/use-toast"

interface UserData {
  fullName: string
  email: string
  referralCode: string
  earnings: {
    available: number
    totalCommission: number
    totalPayout: number
  }
  referrals: Array<{
    fullName: string
    email: string
    createdAt: string
  }>
}

export default function Dashboard() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/user/data")
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch user data")
        }

        setUserData(data)

        // Send welcome notification
        await fetch("/api/notifications/send-welcome", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: data.id }),
        })
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to fetch user data",
          variant: "destructive",
        })
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>
  }

  if (!userData) {
    return <div className="text-red-500">Error: Failed to load user data</div>
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Welcome, {userData.fullName}!</h1>
      <DashboardMetrics userData={userData} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EarningsChart data={userData.earnings} />
        <RecentReferrals referrals={userData.referrals} />
      </div>
      <ReferralNetwork userId={userData.id} />
    </div>
  )
}

