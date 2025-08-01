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
  role: "superadmin" | "admin" | "business_developer" | "developer";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  loginHistory?: string[];

  // Optional user-level overrides (e.g., only for specific cases)
  permissions?: {
    [resource: string]: string[];
  };

  rolePermissions?: {
    permissions?: {
      [resource: string]: string[];
    };
    leadPermissions?: {
      [field: string]: {
        view: boolean;
        edit: boolean;
      };
    };
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}
