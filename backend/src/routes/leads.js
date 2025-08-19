import express from "express";
import * as ctrl from "../controllers/lead.controller.js";
import { protect, authorize } from "../middleware/admin.auth.js";

const router = express.Router();

// Create & read
router.post("/", protect, authorize("business_developer", "admin", "superadmin"), ctrl.create);
router.get("/", protect, ctrl.list);
router.get("/stats/summary", protect, authorize("admin", "superadmin"), ctrl.statsSummary);
router.get("/:id", protect, ctrl.getOne);

// Update & delete
router.put("/:id", protect, authorize("business_developer", "admin", "superadmin"), ctrl.update);
router.patch("/:id/assign", protect, authorize("admin", "superadmin"), ctrl.assign);
router.patch("/:id/status", protect, authorize("business_developer", "admin", "superadmin"), ctrl.changeStatus);
router.delete("/:id", protect, authorize("admin", "superadmin"), ctrl.remove);

export default router;
