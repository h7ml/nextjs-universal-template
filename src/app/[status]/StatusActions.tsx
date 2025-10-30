"use client";

import { Button } from "@/components/ui/Button";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

interface StatusActionsProps {
  statusCode: number;
}

export function StatusActions({ statusCode }: StatusActionsProps) {
  const handleGoBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Status-specific actions */}
      {statusCode === 401 && (
        <div className="mb-8">
          <Button asChild size="lg">
            <Link href="/login">前往登录</Link>
          </Button>
        </div>
      )}

      {statusCode === 404 && (
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">返回首页</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回上一页
          </Button>
        </div>
      )}

      {(statusCode === 500 || statusCode === 502 || statusCode === 503) && (
        <div className="mb-8">
          <Button size="lg" onClick={handleReload} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新页面
          </Button>
        </div>
      )}

      {/* Common Actions */}
      <div className="mt-12 pt-8 border-t">
        <p className="text-sm text-muted-foreground mb-4">您可以尝试：</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleReload}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新页面
          </Button>
          {statusCode !== 401 && (
            <Button asChild variant="outline" size="sm">
              <Link href="/login">登录</Link>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
