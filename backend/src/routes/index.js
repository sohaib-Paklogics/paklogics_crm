import express from "express";
import adminRoutes from "./admin.js";
import leadsRoutes from "./leads.js";
import kanbanRoutes from "./kanban.js";
import attachmentRoutes from "./attachment.js";
import noteRoutes from "./note.js";
import eventRoutes from "./event.js";
import messageRoutes from "./message.js";
import stageRoutes from "./stage.js";
import testTaskRoutes from "./testTask.js";
import rolePermissionsRoutes from "./rolePermissions.js";

import calendarRoutes from "./calendar.js";
import notesRoutes from "./note.js";
import reportsRoutes from "./reports.js";
import notificationsRoutes from "./notifications.js";

const router = express.Router();

// Mount all routes
router.use("/admin-auth", adminRoutes);
router.use("/leads", leadsRoutes);
router.use("/kanban", kanbanRoutes);
router.use("/stages", stageRoutes);

router.use("/", rolePermissionsRoutes);
router.use("/", attachmentRoutes);
router.use("/", noteRoutes);
router.use("/", eventRoutes);
router.use("/", messageRoutes);
router.use("/", testTaskRoutes);

router.use("/calendar", calendarRoutes);
router.use("/notes", notesRoutes);
router.use("/reports", reportsRoutes);
router.use("/notifications", notificationsRoutes);

export default router;
