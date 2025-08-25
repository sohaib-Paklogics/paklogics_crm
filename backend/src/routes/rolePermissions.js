// routes/rolePermissions.routes.js
import express from "express";
import * as ctrl from "../controllers/rolePermissions.controller.js";
import { protect, authorize } from "../middleware/admin.auth.js";

const router = express.Router();

// READ
router.get("/role-permissions", protect, authorize("admin", "superadmin"), ctrl.listAll);
router.get("/role-permissions/:id", protect, authorize("admin", "superadmin"), ctrl.getById);
router.get("/role-permissions/role/:role", protect, authorize("admin", "superadmin"), ctrl.getByRole);

// WRITE
router.post("/role-permissions", protect, authorize("superadmin", "admin"), ctrl.create); // new row
router.put("/role-permissions/:id", protect, authorize("superadmin", "admin"), ctrl.replace); // full replace by id
router.patch("/role-permissions/:id", protect, authorize("superadmin", "admin"), ctrl.update); // partial by id
router.delete("/role-permissions/:id", protect, authorize("superadmin", "admin"), ctrl.remove);

// UPSERT by role (handy for admin panels)
router.put("/role-permissions/role/:role", protect, authorize("superadmin", "admin"), ctrl.upsertByRole);

export default router;
