// app/dashboard/layout.tsx
'use client';

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProtectedRoute from "@/routes/ProtectedRoutes";
import { useSocket } from '@/hooks/use-socket';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize socket connection
  // useSocket();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-auto p-6">
            <ProtectedRoute>{children}</ProtectedRoute>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}