
import api from '../lib/api';

export interface Permission {
  _id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface CreateRoleData {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
}

export const permissionsService = {
  // Get all permissions
  getPermissions: async () => {
    const response = await api.get('/permissions');
    return response.data;
  },

  // Get all roles
  getRoles: async () => {
    const response = await api.get('/roles');
    return response.data;
  },

  // Get single role
  getRole: async (id: string) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  // Create new role
  createRole: async (data: CreateRoleData) => {
    const response = await api.post('/roles', data);
    return response.data;
  },

  // Update role
  updateRole: async (id: string, data: UpdateRoleData) => {
    const response = await api.patch(`/roles/${id}`, data);
    return response.data;
  },

  // Delete role
  deleteRole: async (id: string) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
};
