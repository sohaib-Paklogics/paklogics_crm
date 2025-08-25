// stores/useUserStore.ts
import { create } from "zustand";
import { callApi } from "@/lib/callApi";
import { AdminUser } from "@/types/types";
import { userService } from "@/services/user.service";

type UserStatus = "active" | "inactive" | "suspended";

const normalizeUser = (u: any): AdminUser & { id: string } => ({
  ...u,
  id: u.id ?? u._id, // ensure .id exists for UI
});

interface UserState {
  users: (AdminUser & { id: string })[];
  loading: boolean;

  fetchUsers: (params?: Record<string, any>) => Promise<void>;
  getUser: (id: string) => Promise<(AdminUser & { id: string }) | null>;
  addUser: (
    data: Partial<AdminUser>
  ) => Promise<(AdminUser & { id: string }) | null>;
  updateUser: (
    id: string,
    updates: Partial<AdminUser>
  ) => Promise<(AdminUser & { id: string }) | null>;
  deleteUser: (id: string) => Promise<boolean>;
  toggleUserStatus: (
    id: string,
    status: UserStatus
  ) => Promise<(AdminUser & { id: string }) | null>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,

  // 🔹 Fetch all users
  fetchUsers: async (params) => {
    set({ loading: true });

    const res = await callApi(() => userService.getUsers(params), {
      showSuccess: false,
      showError: true,
    });

    // Your console shows: { success, data: { data: Array, pagination: {...} } }
    const list = res?.success ? res.data?.data ?? res.data ?? [] : [];
    set({
      users: Array.isArray(list) ? list.map(normalizeUser) : [],
      loading: false,
    });
  },

  // 🔹 Get a single user by ID (does not touch list state)
  getUser: async (id) => {
    const res = await callApi(() => userService.getUserById(id), {
      showSuccess: false,
      showError: true,
    });
    return res?.success && res.data ? normalizeUser(res.data) : null;
  },

  // 🔹 Create user
  addUser: async (data) => {
    console.log("📤 addUser called with:", data);
    const res = await callApi(() => userService.createUser(data), {
      showSuccess: true,
      showError: true,
    });
    console.log("📥 addUser response:", res);

    if (res?.success && res.data) {
      set((state) => ({ users: [...state.users, res.data as AdminUser] }));
      return res.data as AdminUser;
    }
    return null;
  },

  // 🔹 Update user
  updateUser: async (id, updates) => {
    const res = await callApi(() => userService.updateUser(id, updates), {
      showSuccess: true,
      showError: true,
    });

    if (res?.success && res.data) {
      const updated = normalizeUser(res.data);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, ...updated } : u)),
      }));
      return updated;
    }
    return null;
  },

  // 🔹 Delete user
  deleteUser: async (id) => {
    const prevUsers = get().users;

    // optimistic update
    set((state) => ({ users: state.users.filter((u) => u.id !== id) }));

    const res = await callApi(() => userService.deleteUser(id), {
      showSuccess: true,
      showError: true,
    });

    if (!res?.success) {
      // rollback if failed
      set({ users: prevUsers });
      return false;
    }
    return true;
  },

  // 🔹 Toggle user status
  toggleUserStatus: async (id, status) => {
    const prevUsers = get().users;

    // optimistic update
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, status } : u)),
    }));

    const res = await callApi(() => userService.toggleStatus(id, status), {
      showSuccess: true,
      showError: true,
    });

    if (res?.success && res.data) {
      const updated = normalizeUser(res.data);
      // ensure store matches backend response
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, ...updated } : u)),
      }));
      return updated;
    } else {
      // rollback on failure
      set({ users: prevUsers });
      return null;
    }
  },
}));
