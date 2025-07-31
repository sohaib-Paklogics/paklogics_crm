import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, UserRole } from "@/lib/types"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },
    }),
    {
      name: "validiz-auth",
    },
  ),
)

export const hasPermission = (userRole: UserRole, action: string, resource: string): boolean => {
  const permissions = {
    admin: {
      leads: ["create", "read", "update", "delete"],
      users: ["create", "read", "update", "delete"],
      reports: ["read"],
      calendar: ["create", "read", "update", "delete"],
      notes: ["create", "read", "update", "delete"],
      chat: ["create", "read"],
      attachments: ["create", "read", "delete"],
    },
    bd: {
      leads: ["create", "read", "update"], // only own leads
      users: [],
      reports: ["read"],
      calendar: ["create", "read", "update"],
      notes: ["create", "read", "update"],
      chat: ["create", "read"],
      attachments: ["create", "read"],
    },
    developer: {
      leads: ["read"], // only assigned leads
      users: [],
      reports: [],
      calendar: ["read", "update"], // only availability
      notes: ["read"],
      chat: ["create", "read"],
      attachments: ["create", "read"],
    },
  }

  return permissions[userRole]?.[resource]?.includes(action) || false
}
