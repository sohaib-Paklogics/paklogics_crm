import { create } from "zustand";
import { callApi } from "@/lib/callApi"; // ← Updated import
import type { User } from "@/types/auth";
import { authService } from "@/services/auth.service";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string) => void;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  clearAuth: () => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setToken: (token) => {
    authService.setToken(token);
    set({
      token,
      isAuthenticated: true,
    });
  },

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  fetchUser: async () => {
    const storedToken = authService.getToken();
    if (!storedToken) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true });

    const response = await callApi(() => authService.getMe(), {
      showSuccess: false,
      showError: false,
    });

    if (response?.success) {
      set({
        user: response.data.user,
        token: storedToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      authService.signOut();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearAuth: () => {
    authService.signOut();
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  logout: () => {
    authService.signOut();
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
}));

export default useAuthStore;
