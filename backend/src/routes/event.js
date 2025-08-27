import express from "express";
import * as ctrl from "../controllers/event.controller.js";
import { protect } from "../middleware/admin.auth.js";

const router = express.Router();

router.get("/events", protect, ctrl.listAll);
router.post("/leads/:id/events", protect, ctrl.create);
router.get("/leads/:id/events", protect, ctrl.list);
router.delete("/events/:eventId", protect, ctrl.remove);

export default router;
