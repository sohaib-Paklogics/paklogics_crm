// routes/testTask.routes.js
import express from "express";
import * as ctrl from "../controllers/testTask.controller.js";
import { protect, authorize } from "../middleware/admin.auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router({ mergeParams: true });

// Lead-scoped
// Create supports MULTIPLE files under field 'attachments'
router.post(
  "/leads/:leadId/test-tasks",
  protect,
  authorize("admin", "business_developer", "superadmin"),
  upload.array("attachments", 10), // <-- was single("file")
  ctrl.create,
);
router.get(
  "/leads/:leadId/test-tasks",
  protect,
  authorize("admin", "business_developer", "superadmin"),
  ctrl.listByLead,
);

// Global (admin view)
authorize("admin", "business_developer", "superadmin"), router.get("/test-tasks", protect, ctrl.listAll);

// Single task
router.get("/test-tasks/:id", protect, authorize("admin", "business_developer", "superadmin"), ctrl.getOne);
router.patch("/test-tasks/:id", protect, authorize("admin", "business_developer", "superadmin"), ctrl.update);
authorize("admin", "business_developer", "superadmin"), router.patch("/test-tasks/:id/assign", protect, ctrl.assign);
authorize("admin", "business_developer", "superadmin"), router.patch("/test-tasks/:id/status", protect, ctrl.setStatus);
authorize("admin", "business_developer", "superadmin"), router.patch("/test-tasks/:id/review", protect, ctrl.review);
authorize("admin", "business_developer", "superadmin"), router.delete("/test-tasks/:id", protect, ctrl.remove);

// --- NEW: attachment management ---
// Add multiple files under field 'attachments'
router.post(
  "/test-tasks/:id/attachments",
  protect,
  authorize("admin", "business_developer", "superadmin"),

  upload.array("attachments", 10),
  ctrl.addAttachments,
);

// Replace a single attachment with field 'attachment'
router.put(
  "/test-tasks/:id/attachments/:attachmentId",
  protect,
  authorize("admin", "business_developer", "superadmin"),

  upload.single("attachment"),
  ctrl.replaceAttachment,
);

// Remove one attachment (no multer needed)
authorize("admin", "business_developer", "superadmin"),
  router.delete("/test-tasks/:id/attachments/:attachmentId", protect, ctrl.removeAttachment);

export default router;
