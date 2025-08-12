import express from "express";
import { sendMessage, getMessages, markAsRead } from "../controllers/chat.controller.js";
import { protect } from "../middleware/admin.auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Note: These routes are also available under /leads/:id/messages
// This provides alternative access patterns if needed

// (Assuming you're missing the actual routes)
router.post("/message", sendMessage);
router.get("/messages", getMessages);
router.patch("/messages/:id/read", markAsRead);

export default router;
