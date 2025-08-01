"use client";
import { AdminTabs } from "@/components/AdminTabs";
import AccessDenied from "@/components/common/AccessDenied";
import { MainLayout } from "@/components/layout/main-layout";
import useAuthStore from "@/stores/auth-store";
import { Shield } from "lucide-react";

export default function AdminPage() {
  const { user, hasPermission } = useAuthStore();

  if (!user) {
    return <AccessDenied />;
  }

  if (!hasPermission({ action: "read", resource: "users" })) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">
            Access denied. Admin privileges required.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-validiz-brown">Admin Panel</h1>
          <p className="text-gray-600 mt-1">
            Manage users and system permissions
          </p>
        </div>

        <AdminTabs />
      </div>
    </MainLayout>
  );
}
