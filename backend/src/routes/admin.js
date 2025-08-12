import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/admin.auth.js";

const router = express.Router();

// Authentication routes
router.post("/login", adminController.login);
router.get("/get-me", protect, adminController.getMe);

// Admin user management routes (requires admin role)
router.post("/add-user", adminController.createAdminUser);
router.get("/", protect, authorize("admin"), adminController.getAdminUsers);
router.get("/:id", protect, authorize("admin"), adminController.getAdminUserById);
router.put("/:id", protect, authorize("admin"), adminController.updateAdminUser);
router.patch("/:id/status", protect, authorize("admin"), adminController.toggleAdminStatus);
router.delete("/:id", protect, authorize("admin"), adminController.deleteAdminUser);
router.patch("/:id/password", protect, authorize("admin"), adminController.changeAdminPassword);

export default router;
