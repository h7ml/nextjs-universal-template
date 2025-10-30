"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AlertCircle, RefreshCw, Home, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16">
      <div className="text-center max-w-2xl w-full">
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl" />
                <AlertCircle className="relative h-16 w-16 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">出现错误</CardTitle>
            <CardDescription className="text-base">
              应用遇到了一个意外错误
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Message */}
            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                错误信息：
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

            {/* Error Stack (Collapsible in production) */}
            {process.env.NODE_ENV === "development" && error.stack && (
              <details className="text-left">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground mb-2">
                  查看错误堆栈
                </summary>
                <pre className="text-xs bg-muted rounded p-3 overflow-auto max-h-48">
                  {error.stack}
                </pre>
              </details>
            )}

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

            {/* Support Info */}
            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                如果问题持续存在，请联系技术支持：
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href="mailto:support@example.com"
                  className="text-primary hover:underline"
                >
                  support@example.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
