"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { Calendar, BarChart3, Settings, User, Menu, X, Kanban, LayoutDashboard, LogOut } from "lucide-react";
import useAuthStore from "@/stores/auth.store";
import Image from "next/image";
import LogoutDialog from "../modals/LogoutDialog";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: null,
  },
  {
    name: "Kanban",
    href: "/kanban",
    icon: Kanban,
    permission: { action: "read", resource: "leads" },
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
    permission: { action: "read", resource: "calendar" },
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    permission: { action: "read", resource: "reports" },
  },
  {
    name: "Admin Panel",
    href: "/admin",
    icon: Settings,
    permission: { action: "read", resource: "users" },
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuthStore();
  const [logoutOpen, setLogoutOpen] = useState(false);

  if (!user) return null;

  const filteredNavigation = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });
  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} className="bg-white shadow-md">
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col ">
          {/* Logo */}
          <div className="flex items-center justify-center h-32 px-4 border-b border-white/10">
            <Image src="/assets/logo-validiz.png" alt="Validiz Logo" width={200} height={75} className="mr-2" />
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors",
                      isActive ? "bg-validiz-mustard text-validiz-gray " : "text-validiz-gray hover:bg-neutral-100 ",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          <div className="px-3">
            <Separator className="bg-[#555555]/30 " />
          </div>
          <div className="p-4 space-y-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center rounded-md px-3 py-3 text-sm font-medium transition-colors",
                pathname === "/profile" ? "bg-validiz-mustard text-white" : "text-validiz-gray hover:bg-neutral-100 ",
              )}
            >
              <User className="mr-3 h-5 w-5" />
              Profile
            </Link>

            <LogoutDialog
              open={logoutOpen}
              onOpenChange={setLogoutOpen}
              onLogout={handleLogout}
              withTrigger={true} // you already have a "Profile" list item; open via setLogoutOpen(true)
            />
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
