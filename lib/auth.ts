"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const router = useRouter()

  useEffect(() => {
    // Check if the user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [router])
}

