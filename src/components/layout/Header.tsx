"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogIn,
  LogOut,
  User as UserIcon,
  Database,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Get current user
  const { data: currentUser, isLoading: userLoading } = trpc.auth.me.useQuery(
    undefined,
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const handleLogout = () => {
    // Clear token from localStorage (JWT is stateless, so client-side removal is sufficient)
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
    // Close user menu
    setShowUserMenu(false);
    // Clear all React Query caches to ensure fresh data on next login
    queryClient.clear();
    // Redirect to login page
    router.push("/login");
    // Force refresh to update the page state
    router.refresh();
  };

  // Navigation items configuration
  const allNavItems = [
    {
      href: "/dashboard",
      label: "看板",
      icon: LayoutDashboard,
      requireAuth: true,
      requireAdmin: false,
    },
    {
      href: "/dashboards",
      label: "管理",
      icon: Settings,
      requireAuth: true,
      requireAdmin: true,
    },
    {
      href: "/data-sources",
      label: "数据源",
      icon: Database,
      requireAuth: true,
      requireAdmin: true,
    },
    {
      href: "/users",
      label: "用户",
      icon: Users,
      requireAuth: true,
      requireAdmin: true,
    },
  ];

  const isLoggedIn = !!currentUser;
  // Check if user is admin - admin users have roleId set (simplified check)
  // For a more accurate check, we'd need to query the role name
  const isAdmin = isLoggedIn && !!currentUser?.roleId;

  // Filter navigation items based on user permissions
  const navItems = allNavItems.filter((item) => {
    if (!item.requireAuth) return true; // Public items
    if (!isLoggedIn) return false; // Require auth but not logged in
    if (item.requireAdmin && !isAdmin) return false; // Require admin but not admin
    return true;
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-8 flex items-center">
          <Link href="/" className="mr-8 flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity" />
              <span className="relative font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🚀 Universal
              </span>
            </div>
          </Link>
          {isLoggedIn && navItems.length > 0 && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-4 py-2 rounded-md text-sm font-medium transition-all",
                      "flex items-center gap-2",
                      isActive
                        ? "text-primary bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
          {userLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : isLoggedIn ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="gap-2"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {(currentUser.name || currentUser.username)
                    ?.charAt(0)
                    .toUpperCase() || "U"}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {currentUser.name || currentUser.username}
                </span>
              </Button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg animate-fade-in overflow-hidden">
                  <div className="p-1">
                    <Link
                      href={`/users/${currentUser.id}`}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                    >
                      <UserIcon className="h-4 w-4" />
                      个人资料
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">登录</span>
              </Button>
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
      {/* Overlay to close user menu when clicking outside */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
