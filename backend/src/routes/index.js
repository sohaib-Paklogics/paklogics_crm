import adminRoutes from "../routes/admin.js";
import express from "express";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/admin-auth",
    route: adminRoutes,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
