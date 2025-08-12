import express from "express";
import adminRoutes from "./admin.js";
import leadsRoutes from "./leads.js";
import calendarRoutes from "./calendar.js";
import notesRoutes from "./notes.js";
import chatRoutes from "./chat.js";
import reportsRoutes from "./reports.js";
import notificationsRoutes from "./notifications.js";

const router = express.Router();

// Mount all routes
router.use("/admin-auth", adminRoutes);
router.use("/leads", leadsRoutes);
router.use("/calendar", calendarRoutes);
router.use("/notes", notesRoutes);
router.use("/chat", chatRoutes);
router.use("/reports", reportsRoutes);
router.use("/notifications", notificationsRoutes);

export default router;
