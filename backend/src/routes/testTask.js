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
  authorize("admin"),
  upload.array("attachments", 10), // <-- was single("file")
  ctrl.create,
);
router.get("/leads/:leadId/test-tasks", protect, ctrl.listByLead);

// Global (admin view)
router.get("/test-tasks", protect, authorize("admin"), ctrl.listAll);

// Single task
router.get("/test-tasks/:id", protect, ctrl.getOne);
router.patch("/test-tasks/:id", protect, authorize("admin"), ctrl.update);
router.patch("/test-tasks/:id/assign", protect, authorize("admin"), ctrl.assign);
router.patch("/test-tasks/:id/status", protect, authorize("admin"), ctrl.setStatus);
router.patch("/test-tasks/:id/review", protect, authorize("admin"), ctrl.review);
router.delete("/test-tasks/:id", protect, authorize("admin"), ctrl.remove);

// --- NEW: attachment management ---
// Add multiple files under field 'attachments'
router.post(
  "/test-tasks/:id/attachments",
  protect,
  authorize("admin"),
  upload.array("attachments", 10),
  ctrl.addAttachments,
);

// Replace a single attachment with field 'attachment'
router.put(
  "/test-tasks/:id/attachments/:attachmentId",
  protect,
  authorize("admin"),
  upload.single("attachment"),
  ctrl.replaceAttachment,
);

// Remove one attachment (no multer needed)
router.delete("/test-tasks/:id/attachments/:attachmentId", protect, authorize("admin"), ctrl.removeAttachment);

export default router;
