"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Calendar,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Kanban,
  Home,
} from "lucide-react";
import useAuthStore from "@/stores/auth-store";
import Image from "next/image";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, permission: null },
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

  if (!user) return null;

  const filteredNavigation = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });
  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white shadow-md"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-validiz-brown text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-24 px-4 border-b border-white/10">
            <Image
              src="/assets/logo.png"
              alt="Validiz Logo"
              width={200}
              height={75}
              className="mr-2"
            />
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
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-validiz-mustard text-validiz-brown"
                        : "text-white hover:bg-white/10 hover:text-validiz-mustard"
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

          <Separator className="bg-white/10" />

          {/* User section */}
          <div className="p-4 space-y-2">
            <Link
              href="/profile"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-white hover:bg-white/10 hover:text-validiz-mustard transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-3 h-5 w-5" />
              Profile
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 hover:text-validiz-mustard"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
            <div className="px-3 py-2 text-xs text-white/70">
              {user.username} ({user.role})
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
