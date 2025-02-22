import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { sign } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const { fullName, username, email, password, phone, state, referCode } = await req.json()

    // Ensure phone is not null or empty string
    const phoneNumber = phone && phone.trim() !== "" ? phone : undefined

    // Check if user already exists (email, username, or phone)
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone: phoneNumber }],
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate unique referral code
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Find referrer if referral code was provided
    let referredBy = null
    if (referCode) {
      referredBy = await User.findOne({ referralCode: referCode })
    }

    // Create new user
    const user = await User.create({
      fullName,
      username,
      email,
      password: hashedPassword,
      phone: phoneNumber,
      state,
      referralCode,
      referredBy: referredBy?._id,
    })

    // Update referrer's referrals array if exists
    if (referredBy) {
      await User.findByIdAndUpdate(referredBy._id, {
        $push: { referrals: user._id },
      })
    }

    // Generate JWT token
    const token = sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" })

    const response = NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        referralCode: user.referralCode,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
