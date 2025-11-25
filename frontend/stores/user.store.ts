// stores/useUserStore.ts
import { create } from "zustand";
import { callApi } from "@/lib/callApi";
import { AdminUser } from "@/types/types";
import { userService } from "@/services/user.service";

type UserStatus = "active" | "inactive" | "suspended";

type NormalizedUser = AdminUser & { id: string };

const normalizeUser = (u: any): NormalizedUser => ({
  ...u,
  id: u.id ?? u._id, // ensure .id exists for UI
});

interface UserState {
  // General users list (for screens that need all admins)
  users: NormalizedUser[];

  // Separate slices for roles we care about in leads
  developers: NormalizedUser[];
  businessDevelopers: NormalizedUser[];

  loading: boolean; // for generic user fetch
  loadingDevelopers: boolean; // for dev-only fetch
  loadingBusinessDevelopers: boolean; // for BD-only fetch
  error: string | null;

  fetchUsers: (params?: Record<string, any>) => Promise<void>;

  fetchDeveloper: (params?: { page?: number; limit?: number; search?: string; status?: string }) => Promise<void>;

  fetchBusinessDeveloper: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => Promise<void>;

  getUser: (id: string) => Promise<NormalizedUser | null>;
  addUser: (data: Partial<AdminUser>) => Promise<NormalizedUser | null>;
  updateUser: (id: string, updates: Partial<AdminUser>) => Promise<NormalizedUser | null>;
  deleteUser: (id: string) => Promise<boolean>;
  toggleUserStatus: (id: string, status: UserStatus) => Promise<NormalizedUser | null>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  developers: [],
  businessDevelopers: [],

  loading: false,
  loadingDevelopers: false,
  loadingBusinessDevelopers: false,
  error: null,

  // 🔹 Fetch all users (generic)
  fetchUsers: async (params) => {
    set({ loading: true, error: null });

    const res = await callApi(() => userService.getUsers(params), {
      showSuccess: false,
      showError: true,
    });

    const list = res?.success ? res.data?.data ?? res.data ?? [] : [];

    set({
      users: Array.isArray(list) ? list.map(normalizeUser) : [],
      loading: false,
    });
  },

  // 🔹 Fetch only developers (backend route: /admin-auth/developers)
  fetchDeveloper: async (params) => {
    set({ loadingDevelopers: true, error: null });

    const res = await callApi(() => userService.getDeveloper(params), {
      showSuccess: false,
      showError: true,
    });

    const list = res?.success ? res.data?.data ?? res.data ?? [] : [];

    set((state) => ({
      // keep existing users; only update the dev slice
      users: state.users,
      developers: Array.isArray(list) ? list.map(normalizeUser) : [],
      loadingDevelopers: false,
    }));
  },

  // 🔹 Fetch only business developers (same backend route but role=business_developer)
  fetchBusinessDeveloper: async (params) => {
    set({ loadingBusinessDevelopers: true, error: null });

    const res = await callApi(() => userService.getBusinessDeveloper(params), {
      showSuccess: false,
      showError: true,
    });

    const list = res?.success ? res.data?.data ?? res.data ?? [] : [];

    set((state) => ({
      // keep existing users; only update the BD slice
      users: state.users,
      businessDevelopers: Array.isArray(list) ? list.map(normalizeUser) : [],
      loadingBusinessDevelopers: false,
    }));
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
    const res = await callApi(() => userService.createUser(data), {
      showSuccess: true,
      showError: true,
    });

    if (res?.success && res.data) {
      const created = normalizeUser(res.data);
      set((state) => ({ users: [...state.users, created] }));
      return created;
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
        // optional: if you want dev/BD lists to also update in place
        developers: state.developers.map((u) => (u.id === id ? { ...u, ...updated } : u)),
        businessDevelopers: state.businessDevelopers.map((u) => (u.id === id ? { ...u, ...updated } : u)),
      }));
      return updated;
    }
    return null;
  },

  // 🔹 Delete user
  deleteUser: async (id) => {
    const prevUsers = get().users;
    const prevDevelopers = get().developers;
    const prevBusinessDevelopers = get().businessDevelopers;

    // optimistic update
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
      developers: state.developers.filter((u) => u.id !== id),
      businessDevelopers: state.businessDevelopers.filter((u) => u.id !== id),
    }));

    const res = await callApi(() => userService.deleteUser(id), {
      showSuccess: true,
      showError: true,
    });

    if (!res?.success) {
      // rollback if failed
      set({
        users: prevUsers,
        developers: prevDevelopers,
        businessDevelopers: prevBusinessDevelopers,
      });
      return false;
    }
    return true;
  },

  // 🔹 Toggle user status
  toggleUserStatus: async (id, status) => {
    const prev = get();

    // optimistic update
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, status } : u)),
      developers: state.developers.map((u) => (u.id === id ? { ...u, status } : u)),
      businessDevelopers: state.businessDevelopers.map((u) => (u.id === id ? { ...u, status } : u)),
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
        developers: state.developers.map((u) => (u.id === id ? { ...u, ...updated } : u)),
        businessDevelopers: state.businessDevelopers.map((u) => (u.id === id ? { ...u, ...updated } : u)),
      }));
      return updated;
    } else {
      // rollback on failure
      set({
        users: prev.users,
        developers: prev.developers,
        businessDevelopers: prev.businessDevelopers,
      });
      return null;
    }
  },
}));
