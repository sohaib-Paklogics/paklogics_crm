import { create } from "zustand";
import { callApi } from "@/lib/callApi";
import { rolePermissionsService } from "@/services/role-permissions.service";
import type { RolePermissions, RoleKey } from "@/types/role-permissions";

type State = {
  // fast lookups by id and by role
  byId: Record<string, RolePermissions>;
  byRole: Partial<Record<RoleKey, RolePermissions>>;

  items: RolePermissions[]; // cached list (optional, for tables)

  isLoading: boolean;
  isSubmit: boolean;
  error: string | null;

  // selectors
  list: () => RolePermissions[];
  getByRole: (role: RoleKey) => RolePermissions | undefined;
  getById: (id: string) => RolePermissions | undefined;

  // actions
  fetchAll: () => Promise<void>;
  fetchByRole: (role: RoleKey) => Promise<RolePermissions | null>;

  create: (
    payload: Omit<RolePermissions, "_id">
  ) => Promise<RolePermissions | null>;
  replace: (
    id: string,
    payload: Omit<RolePermissions, "_id">
  ) => Promise<RolePermissions | null>;
  update: (
    id: string,
    patch: Partial<Omit<RolePermissions, "_id">>
  ) => Promise<RolePermissions | null>;
  remove: (id: string) => Promise<boolean>;

  upsertByRole: (
    role: RoleKey,
    payload: Omit<RolePermissions, "_id" | "role">
  ) => Promise<RolePermissions | null>;
};

export const useRolePermissionsStore = create<State>((set, get) => ({
  byId: {},
  byRole: {},
  items: [],
  isLoading: false,
  isSubmit: false,
  error: null,

  // selectors
  list: () => get().items,
  getByRole: (role) => get().byRole[role],
  getById: (id) => get().byId[id],

  // actions
  fetchAll: async () => {
    set({ isLoading: true, error: null });
    const res = await callApi(() => rolePermissionsService.listAll(), {
      showError: true,
      showSuccess: false,
    });
    set({ isLoading: false });

    if (res?.success) {
      const rows = res.data as RolePermissions[];
      const byId: Record<string, RolePermissions> = {};
      const byRole: Partial<Record<RoleKey, RolePermissions>> = {};
      rows.forEach((r) => {
        byId[r._id] = r;
        byRole[r.role] = r;
      });
      set({ items: rows, byId, byRole });
    }
  },

  fetchByRole: async (role) => {
    const res = await callApi(() => rolePermissionsService.getByRole(role), {
      showError: true,
      showSuccess: false,
    });
    if (!res?.success) return null;
    const doc = res.data as RolePermissions;
    set((s) => ({
      byId: { ...s.byId, [doc._id]: doc },
      byRole: { ...s.byRole, [doc.role]: doc },
      // also keep items coherent: upsert into items
      items: upsertArray(s.items, doc),
    }));
    return doc;
  },

  create: async (payload) => {
    set({ isSubmit: true });

    const res = await callApi(() => rolePermissionsService.create(payload), {});
    set({ isSubmit: false });

    if (!res?.success) return null;
    const doc = res.data as RolePermissions;
    set((s) => ({
      byId: { ...s.byId, [doc._id]: doc },
      byRole: { ...s.byRole, [doc.role]: doc },
      items: upsertArray(s.items, doc),
    }));
    return doc;
  },

  replace: async (id, payload) => {
    const res = await callApi(
      () => rolePermissionsService.replace(id, payload),
      {}
    );
    if (!res?.success) return null;
    const doc = res.data as RolePermissions;
    set((s) => ({
      byId: { ...s.byId, [doc._id]: doc },
      byRole: { ...s.byRole, [doc.role]: doc },
      items: upsertArray(s.items, doc),
    }));
    return doc;
  },

  update: async (id, patch) => {
    const res = await callApi(
      () => rolePermissionsService.update(id, patch),
      {}
    );
    if (!res?.success) return null;
    const doc = res.data as RolePermissions;
    set((s) => ({
      byId: { ...s.byId, [doc._id]: doc },
      byRole: { ...s.byRole, [doc.role]: doc },
      items: upsertArray(s.items, doc),
    }));
    return doc;
  },

  remove: async (id) => {
    const res = await callApi(() => rolePermissionsService.remove(id), {});
    if (!res?.success) return false;

    set((s) => {
      const { [id]: removed, ...restById } = s.byId;
      const byRole = { ...s.byRole };
      if (removed) {
        // drop byRole mapping for this role if it points to same id
        if (byRole[removed.role]?._id === id) {
          delete byRole[removed.role];
        }
      }
      return {
        byId: restById,
        byRole,
        items: s.items.filter((r) => r._id !== id),
      };
    });
    return true;
  },

  upsertByRole: async (role, payload) => {
    set({ isSubmit: true });
    const res = await callApi(
      () => rolePermissionsService.upsertByRole(role, payload),
      {}
    );
    set({ isSubmit: false });
    if (!res?.success) return null;
    const doc = res.data as RolePermissions;
    set((s) => ({
      byId: { ...s.byId, [doc._id]: doc },
      byRole: { ...s.byRole, [doc.role]: doc },
      items: upsertArray(s.items, doc),
    }));
    return doc;
  },
}));

function upsertArray(
  arr: RolePermissions[],
  doc: RolePermissions
): RolePermissions[] {
  const i = arr.findIndex((x) => x._id === doc._id);
  if (i === -1) return [doc, ...arr];
  const next = [...arr];
  next[i] = doc;
  return next;
}
