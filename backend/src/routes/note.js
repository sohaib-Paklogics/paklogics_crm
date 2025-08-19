import express from "express";
import * as ctrl from "../controllers/note.controller.js";
import { protect } from "../middleware/admin.auth.js";

const router = express.Router();

router.post("/leads/:id/notes", protect, ctrl.create);
router.get("/leads/:id/notes", protect, ctrl.list);
router.delete("/leads/:id/notes/:noteId", protect, ctrl.remove);

export default router;
