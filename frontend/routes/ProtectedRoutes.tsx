"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import PageLoader from "@/components/common/PageLoader";
import useAuthStore from "@/stores/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles, // no default []
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Zustand selectors: stable & minimal subscriptions
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Memoize roles to avoid identity churn
  const roles = useMemo<string[] | undefined>(() => {
    if (Array.isArray(allowedRoles) && allowedRoles.length > 0) return allowedRoles;
    return undefined;
  }, [allowedRoles?.join("|")]); // join() gives a stable dep

  // Decide if user passes the role check
  const roleAllowed = useMemo(() => {
    if (!roles) return true; // no role restriction
    if (!user?.role) return false;
    return roles.includes(user.role);
  }, [roles, user?.role]);

  // Redirects happen only in effects, never during render
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (pathname !== "/login") router.replace("/login");
      return;
    }

    // Authenticated:
    if (pathname === "/login" || pathname === "/" || pathname === "/landingMain") {
      router.replace("/dashboard");
      return;
    }

    if (!roleAllowed) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, roleAllowed, pathname, router]);

  // While auth state is loading or we’re redirecting, show loader
  if (isLoading) return <PageLoader />;

  // If authenticated but role not allowed, show loader while effect redirects
  if (isAuthenticated && !roleAllowed) return <PageLoader />;

  // If unauthenticated and not on /login, show loader while effect redirects
  if (!isAuthenticated && pathname !== "/login") return <PageLoader />;

  // Otherwise, render children
  return <>{children}</>;
}
