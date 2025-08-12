// middleware/withPermissions.js
import RolePermissions from "../models/permission.model.js";
import ApiError from "../utils/ApiError.js";

const withPermissions = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        throw new ApiError(401, "Unauthorized");
      }

      // Get role-based permissions
      const rolePermissionDoc = await RolePermissions.findOne({ role: user.role });

      // Check if user has required permissions
      const hasPermission = requiredPermissions.every(permission => {
        const [entity, action] = permission.split('.');
        return rolePermissionDoc?.permissions?.get(entity)?.includes(action);
      });

      if (!hasPermission) {
        throw new ApiError(403, "Insufficient permissions");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default withPermissions;