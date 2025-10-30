"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16">
      <div className="text-center max-w-2xl">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse" />
            <h1 className="relative text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              404
            </h1>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-4 text-foreground">页面未找到</h2>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8">
          抱歉，您访问的页面不存在或已被移动。
          <br />
          请检查 URL 是否正确，或返回首页。
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              返回首页
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => window.history.back()}
          >
            <button className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回上一页
            </button>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            您可以访问以下页面：
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { href: "/", label: "首页" },
              { href: "/dashboard", label: "数据看板" },
              { href: "/dashboards", label: "看板管理" },
              { href: "/login", label: "登录" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Search className="h-3 w-3" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
