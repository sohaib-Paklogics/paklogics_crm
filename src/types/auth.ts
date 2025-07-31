export interface ApiError {
  success: false;
  message: string;
  error?: string;
}
export interface ApiResponse {
  success: boolean;
  message: string;
  data: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SignInData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: "superadmin" | "admin" | "moderator";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
  loginHistory?: string[];
  lastLogin?: string;
}
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}
