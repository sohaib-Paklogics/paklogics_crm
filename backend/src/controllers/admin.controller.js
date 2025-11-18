import * as service from "../services/admin.service.js";
import * as validator from "../validations/admin.validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import RolePermissions from "../models/permission.model.js";

export const login = asyncHandler(async (req, res) => {
  const data = await validator.loginSchema.validateAsync(req.body);
  const result = await service.login(data);
  res.json(ApiResponse.success(result, "Login successful"));
});

export const getMe = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await service.getMe(req.user.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Fetch role-level permissions (not user-level overrides yet)
  const rolePermissionDoc = await RolePermissions.findOne({ role: user.role });

  return res.json(
    ApiResponse.success({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        loginHistory: user.loginHistory,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        permissions: user?.permissions || {},
        rolePermissions: {
          leadPermissions: rolePermissionDoc?.leadPermissions || {},
          permissions: rolePermissionDoc?.permissions || {},
        },
      },
    }),
  );
});

export const createAdminUser = asyncHandler(async (req, res) => {
  const data = await validator.createSchema.validateAsync(req.body);
  const result = await service.createAdminUser(data);
  res.status(201).json(ApiResponse.success(result, "Admin user created successfully", 201));
});

export const getAdminUsers = asyncHandler(async (req, res) => {
  const result = await service.getAdminUsers(req.query);
  res.json(ApiResponse.success(result, "Admin users fetched"));
});

export const getDeveloperUsers = asyncHandler(async (req, res) => {
  const result = await service.getDeveloperUsers(req.query);
  res.json(ApiResponse.success(result, "Developer users fetched"));
});

export const getAdminUserById = asyncHandler(async (req, res) => {
  const result = await service.getAdminUserById(req.params.id);
  if (!result) throw new ApiError(404, "Admin user not found");
  res.json(ApiResponse.success(result, "Admin user fetched"));
});

export const updateAdminUser = asyncHandler(async (req, res) => {
  const data = await validator.updateSchema.validateAsync(req.body);
  const result = await service.updateAdminUser(req.params.id, data);
  res.json(ApiResponse.success(result, "Admin user updated"));
});

export const toggleAdminStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const updated = await service.toggleAdminStatus(req.params.id, status);
  res.json(ApiResponse.success(updated, "Admin status updated"));
});

export const getSingleAdmin = asyncHandler(async (req, res) => {
  const admin = await service.getSingleAdmin(req.params.id);
  if (!admin) throw new ApiError(404, "Admin not found");
  res.json(ApiResponse.success(admin, "Admin fetched"));
});

export const deleteAdminUser = asyncHandler(async (req, res) => {
  await service.deleteAdminUser(req.params.id);
  res.json(ApiResponse.success(null, "Admin user deleted"));
});

export const changeAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adminId = req.params.id;
  const result = await service.changeAdminPasswordService(adminId, currentPassword, newPassword);
  res.json(ApiResponse.success(result, "Password changed successfully"));
});
