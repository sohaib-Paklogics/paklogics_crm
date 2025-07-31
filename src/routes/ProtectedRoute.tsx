// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import PageLoader from "@/components/common/PageLoader";

interface ProtectedRouteProps {
  userTypes?: string[]; // e.g., ['agent', 'client']
  redirectTo?: string;
}

const ProtectedRoute = ({
  userTypes = [],
  redirectTo = "/login",
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  console.log({ userTypes, redirectTo }, "props");
  console.log({ isAuthenticated, user, isLoading });

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  // Redirect to /dashboard instead of /
  if (userTypes.length > 0 && (!user || !userTypes.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
