import { ScrollArea } from "@/components/ui/scroll-area"

interface Activity {
  type: string
  description: string
  date: string
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex justify-between space-x-4">
            <div>
              <p className="text-sm font-medium leading-none">{activity.type}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
            </div>
            <p className="text-sm text-muted-foreground">{activity.date}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

