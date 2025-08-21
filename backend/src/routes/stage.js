// routes/stage.routes.js
import express from "express";
import * as ctrl from "../controllers/stage.controller.js";
import { protect, authorize } from "../middleware/admin.auth.js";

const router = express.Router();

router.get("/", protect, ctrl.list);
router.get("/:id", protect, ctrl.get);
router.post("/", protect, authorize("admin"), ctrl.create);
router.post("/adjacent", protect, authorize("admin"), ctrl.createAdjacent);
router.patch("/:id", protect, authorize("admin"), ctrl.update);
router.delete("/:id", protect, authorize("admin"), ctrl.remove);
router.patch("/reorder/all", protect, authorize("admin"), ctrl.reorder);

export default router;
