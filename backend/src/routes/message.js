import express from "express";
import * as ctrl from "../controllers/message.controller.js";
import { protect } from "../middleware/admin.auth.js";

const router = express.Router();

// Lead-scoped chat
router.post("/leads/:id/messages", protect, ctrl.create);
router.get("/leads/:id/messages", protect, ctrl.list);
router.patch("/leads/:id/messages/read", protect, ctrl.markAllRead);

// Message-scoped ops
router.patch("/messages/:messageId/read", protect, ctrl.markRead);
router.patch("/:id/messages/:messageId", protect, ctrl.editMessage);
router.delete("/messages/:messageId", protect, ctrl.remove);

export default router;
