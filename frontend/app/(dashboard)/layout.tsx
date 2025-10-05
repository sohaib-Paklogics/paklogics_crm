// app/dashboard/layout.tsx
"use client";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProtectedRoute from "@/routes/ProtectedRoutes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden ">
          <div className="lg:ml-64">
            <Navbar />
          </div>

          <main className="flex-1 overflow-auto ">
            <ProtectedRoute>{children}</ProtectedRoute>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
