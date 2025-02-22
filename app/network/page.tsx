"use client"

import { useAuth } from "@/lib/auth"
import { ReferralNetwork } from "@/components/referral-network"

export default function NetworkPage() {
  useAuth() // This will redirect to login if not authenticated

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Network</h1>
      <ReferralNetwork />
    </div>
  )
}

