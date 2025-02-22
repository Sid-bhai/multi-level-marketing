"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function WalletPage() {
  useAuth() // This will redirect to login if not authenticated

  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // Simulating API call to fetch wallet balance
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay
        setBalance(1500)
      } catch (err) {
        setError("Failed to fetch wallet balance. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Wallet</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">${balance?.toFixed(2)}</p>
          <div className="mt-4 space-x-4">
            <Button>Deposit</Button>
            <Button variant="outline">Withdraw</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

