import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const { userId } = await req.json()

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const welcomeNotification = {
      title: "Welcome to MLM Platform",
      content: "Thank you for joining our platform. Start building your network today!",
      date: new Date(),
      read: false,
      type: "notification",
    }

    user.notifications = user.notifications || []
    user.notifications.unshift(welcomeNotification)
    await user.save()

    return NextResponse.json({ message: "Welcome notification sent successfully" })
  } catch (error) {
    console.error("Send welcome notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

