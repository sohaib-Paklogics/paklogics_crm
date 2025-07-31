import { lazy } from "react";
import { RouteObject, Navigate } from "react-router-dom";
import { PATH } from "@/constants/path";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardPage from "@/pages/dashboard/Dashboard";
import LoginPage from "@/pages/auth/Login";
import NotFoundPage from "@/components/common/NotFoundPage";

// Lazy load the pages

export const routes: RouteObject[] = [
  {
    path: PATH.LOGIN,
    element: <LoginPage />,
  },
  {
    path: "/", // Redirect root to /dashboard
    element: <Navigate to={PATH.DASHBOARD} replace />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        element: <ProtectedRoute userTypes={["admin", "superadmin"]} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                path: PATH.DASHBOARD,
                element: <DashboardPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];
