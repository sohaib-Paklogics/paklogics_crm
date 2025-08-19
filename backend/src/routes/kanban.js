import express from "express";
import * as ctrl from "../controllers/kanban.controller.js";
import { protect, authorize } from "../middleware/admin.auth.js";

const router = express.Router();

router.get("/leads", protect, ctrl.board);
router.patch("/leads/:id/move", protect, authorize("business_developer", "admin", "superadmin"), ctrl.move);

export default router;
