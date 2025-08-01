"use client";

import { ChevronDown, Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/auth-store";

export const Navbar = () => {
  const { toggleSidebar } = useSidebar();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const initials = user?.username?.slice(0, 1)?.toUpperCase() || "U";

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4">
      <div className="flex items-center justify-between w-full">
        {/* Left side - Mobile menu trigger and search */}
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          {/* Page Title and Breadcrumb */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-500">Overview</span>
          </div>
        </div>

        {/* Right side - User Menu */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-gray-50"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {initials}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.username || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role || "Admin"}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user?.username || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || "admin@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
