"use client";

import type React from "react";

import { Sidebar } from "./sidebar";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import useAuthStore from "@/stores/auth-store";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      redirect("/login");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
