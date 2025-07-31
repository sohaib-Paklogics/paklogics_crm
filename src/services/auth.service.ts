import api from "../lib/api";
import type { ApiResponse, SignInData } from "../types/auth";

const TOKEN_KEY = "template-access-token";

export const authService = {
  signIn: async (data: SignInData): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/admin-auth/login", data);
    const result = response.data;

    if (result.success && result.data?.token) {
      localStorage.setItem(TOKEN_KEY, result.data.token);
    }

    return result;
  },

  signOut: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getMe: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>("/admin-auth/get-me");
    return response.data;
  },

  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/auth/verify-email", {
      token,
    });
    return response.data;
  },

  resendVerification: async (email: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/auth/resend-verification", {
      email,
    });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  resetPassword: async (
    token: string,
    password: string
  ): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  updateProfile: async (data: { username: string; email: string }) => {
    return await api.put("/auth/update-profile", data);
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return await api.post("/auth/change-password", data);
  },
};
