import { create } from "zustand";
import { callApi } from "@/lib/callApi";
import type { User } from "@/types/auth";
import { authService } from "@/services/auth.service";

// Field-level permissions (leadPermissions)
type FieldPermission = {
  view: boolean;
  edit: boolean;
};

// Action-based permissions like { leads: ["read", "update"] }
type PermissionsMap = {
  [resource: string]: string[];
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: PermissionsMap | null; // merged permissions
  leadPermissions: { [field: string]: FieldPermission } | null;

  setToken: (token: string) => void;
  setUser: (user: User | null) => void;
  setPermissions: (permissions: PermissionsMap | null) => void;
  fetchUser: () => Promise<void>;
  clearAuth: () => void;
  logout: () => void;

  hasPermission: (perm: { action: string; resource: string }) => boolean;
  canView: (field: string) => boolean;
  canEdit: (field: string) => boolean;
}

const mergePermissions = (
  userPerms?: PermissionsMap,
  rolePerms?: PermissionsMap
): PermissionsMap => {
  const merged: PermissionsMap = {};

  if (rolePerms) {
    for (const [resource, actions] of Object.entries(rolePerms)) {
      merged[resource] = [...new Set(actions)];
    }
  }

  if (userPerms) {
    for (const [resource, actions] of Object.entries(userPerms)) {
      merged[resource] = [
        ...new Set([...(merged[resource] || []), ...actions]),
      ];
    }
  }

  return merged;
};

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  permissions: null,
  leadPermissions: null,

  setToken: (token) => {
    authService.setToken(token);
    set({ token, isAuthenticated: true });
  },

  setUser: (user) => {
    if (!user) {
      set({
        user: null,
        permissions: null,
        leadPermissions: null,
        isAuthenticated: false,
      });
      return;
    }

    const mergedPermissions = mergePermissions(
      user.permissions,
      user.rolePermissions?.permissions
    );

    set({
      user,
      permissions: mergedPermissions,
      leadPermissions: user.rolePermissions?.leadPermissions ?? null,
      isAuthenticated: true,
    });
  },

  setPermissions: (permissions) => {
    set({ permissions });
  },

  fetchUser: async () => {
    const storedToken = authService.getToken();

    if (!storedToken) {
      set({
        user: null,
        token: null,
        permissions: null,
        leadPermissions: null,
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
      const user = response.data.user;
      const mergedPermissions = mergePermissions(
        user.permissions,
        user.rolePermissions?.permissions
      );

      set({
        user,
        token: storedToken,
        permissions: mergedPermissions,
        leadPermissions: user.rolePermissions?.leadPermissions ?? null,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      authService.signOut();
      set({
        user: null,
        token: null,
        permissions: null,
        leadPermissions: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearAuth: () => {
    authService.signOut();
    set({
      user: null,
      token: null,
      permissions: null,
      leadPermissions: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  logout: () => {
    authService.signOut();
    set({
      user: null,
      token: null,
      permissions: null,
      leadPermissions: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  hasPermission: ({ action, resource }) => {
    const { permissions, user } = get();

    if (user?.role === "superadmin") return true;
    if (!permissions || !permissions[resource]) return false;

    return permissions[resource].includes(action);
  },

  canView: (field: string) => {
    const { leadPermissions, user } = get();
    if (user?.role === "superadmin") return true;
    return leadPermissions?.[field]?.view ?? false;
  },

  canEdit: (field: string) => {
    const { leadPermissions, user } = get();
    if (user?.role === "superadmin") return true;
    return leadPermissions?.[field]?.edit ?? false;
  },
}));

export default useAuthStore;
