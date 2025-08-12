
import express from "express";
import { getNotifications, markAsRead, createNotification } from "../controllers/notifications.controller.js";
import { protect } from "../middleware/admin.auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Notifications routes
router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);
router.post("/", createNotification);

export default router;
