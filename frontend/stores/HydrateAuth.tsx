"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "./auth.store";
import { authService } from "@/services/auth.service";
import { jwtDecode } from "jwt-decode";

function isTokenValid(token: string): boolean {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function HydrateAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const setToken = useAuthStore((s) => s.setToken);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    const token = authService.getToken();

    const hydrate = async () => {
      if (token && isTokenValid(token)) {
        setToken(token);
        await fetchUser();

        // ✅ If already logged in and trying to access /login, redirect to dashboard
        if (pathname === "/login") {
          router.replace("/dashboard");
        }
      } else {
        clearAuth();
      }

      setHydrated(true);
    };

    hydrate();
  }, [setToken, fetchUser, clearAuth, pathname, router]);

  if (!hydrated) return null;

  return <>{children}</>;
}
