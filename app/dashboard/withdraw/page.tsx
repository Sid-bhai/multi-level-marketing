"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface WithdrawData {
  availableBalance: number
  pendingWithdrawals: number
  bankDetails: {
    accountNumber: string
    bankName: string
    accountName: string
  } | null
}

export default function WithdrawPage() {
  const [withdrawData, setWithdrawData] = useState<WithdrawData | null>(null)
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWithdrawData = async () => {
      try {
        const res = await fetch("/api/user/withdraw-info")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setWithdrawData(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load withdrawal information",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchWithdrawData()
  }, [])

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!withdrawData?.bankDetails) {
      toast({
        title: "Error",
        description: "Please add bank details first",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch("/api/user/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number.parseFloat(amount) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully",
      })
      setAmount("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process withdrawal",
        variant: "destructive",
      })
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (!withdrawData) return <div>Failed to load withdrawal information</div>

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Withdraw</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Balance Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Available Balance</Label>
              <div className="text-2xl font-bold">${withdrawData?.availableBalance?.toFixed(2) || "0.00"}</div>
            </div>
            <div className="space-y-2">
              <Label>Pending Withdrawals</Label>
              <div className="text-xl
              text-muted-foreground">${withdrawData?.pendingWithdrawals?.toFixed(2) || "0.00"}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {withdrawData?.bankDetails ? (
              <>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input value={withdrawData?.bankDetails?.accountNumber} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input value={withdrawData?.bankDetails?.bankName} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input value={withdrawData?.bankDetails?.accountName} readOnly />
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">No bank details added</p>
                <Button variant="outline">Add Bank Details</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Make Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount to withdraw"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={!withdrawData?.bankDetails || Number.parseFloat(amount) > withdrawData?.availableBalance}
              >
                Submit Withdrawal
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}