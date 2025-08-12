import express from "express";
import { createNote, getNotes } from "../controllers/notes.controller.js";
import { protect } from "../middleware/admin.auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Note: These routes are also available under /leads/:id/notes
// This provides alternative access patterns if needed

// Assuming you want to define standalone routes as well
router.post("/notes", createNote);
router.get("/notes", getNotes);

export default router;
