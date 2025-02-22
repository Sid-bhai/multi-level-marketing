"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface UserProfile {
  fullName: string
  email: string
  phone: string
  state: string
  referralCode: string
  username: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setProfile(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (isLoading) return <div>Loading...</div>
  if (!profile) return <div>Failed to load profile</div>

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={profile.fullName} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={profile.username} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={profile.phone} readOnly />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={profile.state} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Referral Code</Label>
              <div className="flex gap-2">
                <Input value={profile.referralCode} readOnly />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(profile.referralCode)
                    toast({ description: "Referral code copied!" })
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

