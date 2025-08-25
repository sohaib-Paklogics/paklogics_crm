import api from "@/lib/api";
import type { ApiResponse } from "@/types/lead"; // or "@/types/api"
import type { RolePermissions, RoleKey } from "@/types/role-permissions";

export const rolePermissionsService = {
  listAll: async (): Promise<ApiResponse<RolePermissions[]>> => {
    const { data } = await api.get("/role-permissions");
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<RolePermissions>> => {
    const { data } = await api.get(`/role-permissions/${id}`);
    return data;
  },

  getByRole: async (role: RoleKey): Promise<ApiResponse<RolePermissions>> => {
    const { data } = await api.get(`/role-permissions/role/${role}`);
    return data;
  },

  create: async (
    payload: Omit<RolePermissions, "_id">
  ): Promise<ApiResponse<RolePermissions>> => {
    const { data } = await api.post("/role-permissions", payload);
    return data;
  },

  replace: async (
    id: string,
    payload: Omit<RolePermissions, "_id">
  ): Promise<ApiResponse<RolePermissions>> => {
    const { data } = await api.put(`/role-permissions/${id}`, payload);
    return data;
  },

  update: async (
    id: string,
    patch: Partial<Omit<RolePermissions, "_id">>
  ): Promise<ApiResponse<RolePermissions>> => {
    const { data } = await api.patch(`/role-permissions/${id}`, patch);
    return data;
  },

  remove: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/role-permissions/${id}`);
    return data;
  },

  upsertByRole: async (
    role: RoleKey,
    payload: Omit<RolePermissions, "_id" | "role"> & { role?: RoleKey } // role enforced in route
  ): Promise<ApiResponse<RolePermissions>> => {
    const { data } = await api.put(`/role-permissions/role/${role}`, payload);
    return data;
  },
};
