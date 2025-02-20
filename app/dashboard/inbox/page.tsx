import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const messages = [
  {
    id: 1,
    subject: "Welcome to NetworkPro!",
    preview: "Thank you for joining our network marketing platform...",
    date: "2023-06-01",
    read: false,
  },
  {
    id: 2,
    subject: "New Referral Bonus",
    preview: "Congratulations! You've earned a new referral bonus...",
    date: "2023-06-05",
    read: true,
  },
  {
    id: 3,
    subject: "Monthly Newsletter",
    preview: "Check out our latest updates and tips for success...",
    date: "2023-06-10",
    read: true,
  },
]

export default function InboxPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Inbox</h1>
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {messages.map((message) => (
              <li key={message.id} className="flex items-center space-x-4 p-4 border rounded-md">
                <div className={`w-2 h-2 rounded-full ${message.read ? "bg-gray-300" : "bg-blue-500"}`} />
                <div className="flex-1">
                  <h3 className="font-semibold">{message.subject}</h3>
                  <p className="text-sm text-gray-600">{message.preview}</p>
                </div>
                <span className="text-sm text-gray-500">{message.date}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

