// middleware/withPermissions.js
import RolePermissions from "../models/RolePermissions.js";

export const withPermissions = async (req, res, next) => {
  try {
    const user = req.user; // assumed from JWT
    const permissions = await RolePermissions.findOne({ role: user.role });

    if (!permissions) {
      return res.status(403).json({ error: "No permissions defined for this role" });
    }

    req.permissions = permissions;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Permission check failed" });
  }
};
