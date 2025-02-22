import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, TrendingUp, Link } from "lucide-react"

interface UserData {
  availableBalance: number
  totalCommission: number
  totalPayout: number
  referralLink: string
}

export function DashboardMetrics({ userData }: { userData?: UserData }) {
  if (!userData) {
    return <div>Loading user data...</div>
  }
/*
  const metrics = [
    { title: "Available Balance", value: `$${userData?.availableBalance?.toFixed(2)}`, icon: DollarSign },
    { title: "Total Commission", value: `$${userData?.totalCommission?.toFixed(2)}`, icon: TrendingUp },
    { title: "Total Payout", value: `$${userData?.totalPayout?.toFixed(2)}`, icon: Users },
    { title: "Referral Link", value: userData.referralLink, icon: Link },
  ]
*/

const metrics = [
  { title: "Available Balance", value: `$${(userData.availableBalance ?? 0).toFixed(2)}`, icon: DollarSign },
  { title: "Total Commission", value: `$${(userData.totalCommission ?? 0).toFixed(2)}`, icon: TrendingUp },
  { title: "Total Payout", value: `$${(userData.totalPayout ?? 0).toFixed(2)}`, icon: Users },
  { title: "Referral Link", value: userData.referralLink || "N/A", icon: Link },
]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

