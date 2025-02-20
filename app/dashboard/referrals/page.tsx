import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReferralTree } from "@/components/dashboard/referral-tree"

export default function ReferralsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Referrals</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value="https://networkpro.com/ref/user123"
              readOnly
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <button className="px-4 py-2 text-white bg-primary rounded-md">Copy</button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Referral Network</CardTitle>
        </CardHeader>
        <CardContent>
          <ReferralTree />
        </CardContent>
      </Card>
    </div>
  )
}

