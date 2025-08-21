// routes/kanban.routes.js
import express from "express";
import { protect } from "../middleware/admin.auth.js";
import * as ctrl from "../controllers/kanban.controller.js";

const router = express.Router();

router.get("/board", protect, ctrl.board);
router.patch("/leads/:leadId/move", protect, ctrl.move);

export default router;
