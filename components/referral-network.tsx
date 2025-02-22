import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NetworkMember {
  name: string
  level: number
  children: NetworkMember[]
}

const networkData: NetworkMember = {
  name: "You",
  level: 0,
  children: [
    {
      name: "Alice",
      level: 1,
      children: [
        { name: "Charlie", level: 2, children: [] },
        { name: "David", level: 2, children: [] },
      ],
    },
    {
      name: "Bob",
      level: 1,
      children: [
        { name: "Eve", level: 2, children: [] },
        { name: "Frank", level: 2, children: [] },
      ],
    },
  ],
}

function NetworkNode({ member }: { member: NetworkMember }) {
  return (
    <div className="flex flex-col items-center">
      <Avatar className="h-12 w-12">
        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${member.name}`} />
        <AvatarFallback>{member.name[0]}</AvatarFallback>
      </Avatar>
      <p className="mt-2 text-sm font-medium">{member.name}</p>
      {member.children.length > 0 && (
        <div className="mt-4 flex space-x-8">
          {member.children.map((child, index) => (
            <NetworkNode key={index} member={child} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ReferralNetwork() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral Network</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-max">
          <NetworkNode member={networkData} />
        </div>
      </CardContent>
    </Card>
  )
}

