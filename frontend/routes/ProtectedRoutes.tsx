"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import PageLoader from "@/components/common/PageLoader";
import useAuthStore from "@/stores/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Memoize roles to avoid identity churn
  const roles = useMemo<string[] | undefined>(() => {
    if (Array.isArray(allowedRoles) && allowedRoles.length > 0) return allowedRoles;
    return undefined;
  }, [allowedRoles?.join("|")]);

  // Decide if user passes the role check
  const roleAllowed = useMemo(() => {
    if (!roles) return true;
    if (!user?.role) return false;
    return roles.includes(user.role);
  }, [roles, user?.role]);

  useEffect(() => {
    if (isLoading) return;

    // Public routes that don't need authentication
    const publicRoutes = ["/landingPage", "/login"];
    const isPublicRoute = publicRoutes.includes(pathname);

    // If not authenticated
    if (!isAuthenticated) {
      // If on root, go to landing page first
      if (pathname === "/") {
        router.replace("/landingPage");
        return;
      }
      // If not on a public route, redirect to landing page (not login)
      if (!isPublicRoute) {
        router.replace("/landingPage");
        return;
      }
      // Already on a public route, do nothing
      return;
    }

    // If authenticated
    if (isAuthenticated) {
      // Redirect from public routes to dashboard
      if (isPublicRoute || pathname === "/") {
        router.replace("/dashboard");
        return;
      }

      // Check role permissions for protected routes
      if (!roleAllowed) {
        router.replace("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, roleAllowed, pathname, router]);

  // While auth state is loading, show loader
  if (isLoading) return <PageLoader />;

  // Public routes - always render
  const publicRoutes = ["/landingPage", "/login"];
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // If authenticated but role not allowed, show loader while redirecting
  if (isAuthenticated && !roleAllowed) return <PageLoader />;

  // If not authenticated and not on public route, show loader while redirecting
  if (!isAuthenticated) return <PageLoader />;

  // Authenticated and role allowed - render children
  return <>{children}</>;
}
