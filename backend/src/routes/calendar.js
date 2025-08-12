import express from "express";
import { createEvent, getEvents, deleteEvent } from "../controllers/calendar.controller.js";
import { protect } from "../middleware/admin.auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Calendar event routes
router.post("/event", createEvent);
router.get("/events", getEvents);
router.delete("/event/:id", deleteEvent);

export default router;
