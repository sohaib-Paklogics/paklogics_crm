// services/userService.ts

import api from "@/lib/api";
import { ApiResponse } from "@/types/auth";
import { AdminUser } from "@/types/types";

export const userService = {
  // 🔹 Get all admin users (with optional filters/pagination)
  getUsers: async (params?: Record<string, any>): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>("/admin-auth", {
      params,
    });
    console.log("Fetched users:", response.data);
    return response.data;
  },

  // 🔹 Get single admin user by ID
  getUserById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>(`/admin-auth/${id}`);
    return response.data;
  },

  // 🔹 Create admin user
  createUser: async (data: Partial<AdminUser>): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/admin-auth", data);
    return response.data;
  },

  // 🔹 Update admin user
  updateUser: async (
    id: string,
    data: Partial<AdminUser>
  ): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(`/admin-auth/${id}`, data);
    return response.data;
  },

  // 🔹 Delete admin user
  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/admin-auth/${id}`);
    return response.data;
  },

  // 🔹 Toggle admin status
  toggleStatus: async (
    id: string,
    status: "active" | "inactive" | "suspended"
  ): Promise<ApiResponse> => {
    const response = await api.patch<ApiResponse>(`/admin-auth/${id}/status`, {
      status,
    });
    return response.data;
  },

  // 🔹 Change admin password
  changePassword: async (
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(
      `/admin-auth/${id}/change-password`,
      {
        currentPassword,
        newPassword,
      }
    );
    return response.data;
  },
};
