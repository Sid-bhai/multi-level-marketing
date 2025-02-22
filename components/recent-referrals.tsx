import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const recentReferrals = [
  { name: "Alice Johnson", email: "alice@example.com", date: "2023-06-01" },
  { name: "Bob Smith", email: "bob@example.com", date: "2023-05-28" },
  { name: "Charlie Brown", email: "charlie@example.com", date: "2023-05-25" },
  { name: "Diana Ross", email: "diana@example.com", date: "2023-05-22" },
]

export function RecentReferrals() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Referrals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentReferrals.map((referral) => (
            <div key={referral.email} className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${referral.name}`} />
                <AvatarFallback>
                  {referral.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{referral.name}</p>
                <p className="text-sm text-muted-foreground">{referral.email}</p>
              </div>
              <div className="text-sm text-muted-foreground">{referral.date}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

