import { create } from "zustand"
import type { User } from "@/lib/types"

interface UserState {
  users: User[]
  loading: boolean
  setUsers: (users: User[]) => void
  addUser: (user: User) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, updates) =>
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? { ...user, ...updates } : user)),
    })),
  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
}))
