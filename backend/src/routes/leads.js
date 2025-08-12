import express from "express";
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignDeveloper,
  updateLeadStatus,
  uploadAttachment,
} from "../controllers/leads.controller.js";

import { createNote, getNotes } from "../controllers/notes.controller.js";

import { sendMessage, getMessages, markAsRead } from "../controllers/chat.controller.js";

import { authorize, protect } from "../middleware/admin.auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Lead routes
router.post("/", authorize("super_admin", "admin", "business_developer"), createLead);
router.get("/", getLeads);
router.get("/:id", getLeadById);
router.patch("/:id", authorize("super_admin", "admin", "business_developer"), updateLead);
router.delete("/:id", deleteLead);
router.post("/:id/assign", authorize("super_admin", "admin", "business_developer"), assignDeveloper);
router.patch("/:id/status", updateLeadStatus);
router.post("/:id/attachments", uploadAttachment);

// Notes routes (nested under leads)
router.post("/:id/notes", createNote);
router.get("/:id/notes", getNotes);

// Chat routes (nested under leads)
router.post("/:id/messages", sendMessage);
router.get("/:id/messages", getMessages);
router.patch("/:id/messages/read", markAsRead);

export default router;
