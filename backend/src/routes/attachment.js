import express from "express";
import * as ctrl from "../controllers/attachment.controller.js";
import { upload } from "../middleware/upload.js";
import { protect, authorize } from "../middleware/admin.auth.js";

const router = express.Router();

router.post(
  "/leads/:id/attachments",
  protect,
  authorize("business_developer", "admin", "superadmin"),
  upload.single("file"),
  ctrl.upload,
);
router.get("/leads/:id/attachments", protect, ctrl.list);
router.delete(
  "/attachments/:attachmentId",
  protect,
  authorize("business_developer", "admin", "superadmin"),
  ctrl.remove,
);

export default router;
