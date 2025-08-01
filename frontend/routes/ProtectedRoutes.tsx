"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import PageLoader from "@/components/common/PageLoader";
import useAuthStore from "@/stores/auth-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({
  children,
  allowedRoles = [],
}: ProtectedRouteProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // ✅ Not authenticated → redirect to login
    if (!isAuthenticated) {
      if (pathname !== "/login") {
        router.replace("/login");
      }
    }
    // ✅ Authenticated → redirect away from login
    else if (pathname === "/login") {
      router.replace("/dashboard");
    }
    // ✅ If role check fails
    else if (
      allowedRoles.length > 0 &&
      (!user || !allowedRoles.includes(user.role))
    ) {
      router.replace("/");
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, pathname, router]);

  if (isLoading || !checked) return <PageLoader />;

  return <>{children}</>;
};

export default ProtectedRoute;
