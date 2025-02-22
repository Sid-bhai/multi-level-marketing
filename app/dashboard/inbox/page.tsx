"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Mail } from "lucide-react"

interface Message {
  id: string
  title: string
  content: string
  date: string
  read: boolean
  type: "notification" | "message"
}

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/user/messages")
        const data = await res.json()
        setMessages(data)
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [])

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Inbox</h1>
      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id} className={message.read ? "opacity-75" : ""}>
            <CardHeader className="flex flex-row items-center gap-4">
              {message.type === "notification" ? <Bell className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
              <CardTitle className="text-lg">{message.title}</CardTitle>
              <span className="ml-auto text-sm text-muted-foreground">{message.date}</span>
            </CardHeader>
            <CardContent>
              <p>{message.content}</p>
            </CardContent>
          </Card>
        ))}
        {messages.length === 0 && (
          <Card>
            <CardContent className="text-center py-6">
              <p className="text-muted-foreground">No messages yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

