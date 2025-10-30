"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 bg-background">
          <div className="text-center max-w-xl w-full space-y-6">
            {/* Error Icon */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-2xl animate-pulse" />
                <AlertTriangle className="relative h-20 w-20 text-destructive" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold mb-2 text-foreground">
                严重错误
              </h1>
              <p className="text-muted-foreground">
                应用遇到了一个严重错误，无法继续运行
              </p>
            </div>

            {/* Error Message */}
            <div className="bg-muted rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                错误详情：
              </p>
              <p className="text-sm text-foreground font-mono break-all">
                {error.message || "未知错误"}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  错误代码: {error.digest}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button onClick={reset} size="lg" className="w-full sm:w-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                重试
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  返回首页
                </Link>
              </Button>
            </div>

            {/* Help Text */}
            <div className="pt-6 border-t">
              <p className="text-xs text-muted-foreground">
                如果问题持续存在，请刷新页面或联系技术支持
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
