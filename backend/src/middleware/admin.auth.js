import jwt from "jsonwebtoken";
import AdminUser from "../models/admin.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import process from "process";

const adminAuth = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Access token is required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AdminUser.findById(decoded.id).select("-password");

    if (!user || user.status !== "active") {
      throw new ApiError(401, "Invalid or inactive user");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error || "Invalid token");
  }
});

export async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await AdminUser.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    next();
  } catch (err) {
    res.status(401).json({ error: err || "Token failed or expired" });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

export default adminAuth;
