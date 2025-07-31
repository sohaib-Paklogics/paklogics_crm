"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useLeadStore } from "@/lib/stores/lead-store"
import { useUserStore } from "@/lib/stores/user-store"
import { mockUsers, mockLeads } from "@/lib/mock-data"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const { setLeads } = useLeadStore()
  const { setUsers } = useUserStore()

  useEffect(() => {
    // Initialize mock data
    setLeads(mockLeads)
    setUsers(mockUsers)
  }, [setLeads, setUsers])

  return <>{children}</>
}
