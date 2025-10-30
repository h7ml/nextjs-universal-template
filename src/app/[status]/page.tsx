"use client";

import { Button } from "@/components/ui/Button";
import { AlertCircle, Info, Server, Shield, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StatusActions } from "./StatusActions";

// Edge Runtime 配置（Cloudflare Pages 需要）
export const runtime = "edge";

type StatusCode = 400 | 401 | 403 | 404 | 500 | 502 | 503;

const statusMessages: Record<
  StatusCode,
  {
    title: string;
    description: string;
    icon: typeof AlertCircle;
    color: string;
  }
> = {
  400: {
    title: "请求错误",
    description: "您的请求格式不正确，请检查后重试。",
    icon: XCircle,
    color: "text-orange-600",
  },
  401: {
    title: "未授权",
    description: "您需要登录才能访问此页面。",
    icon: Shield,
    color: "text-yellow-600",
  },
  403: {
    title: "禁止访问",
    description: "您没有权限访问此页面。",
    icon: AlertCircle,
    color: "text-red-600",
  },
  404: {
    title: "页面未找到",
    description: "您访问的页面不存在或已被移动。",
    icon: Info,
    color: "text-blue-600",
  },
  500: {
    title: "服务器错误",
    description: "服务器遇到了一个错误，请稍后重试。",
    icon: Server,
    color: "text-red-600",
  },
  502: {
    title: "网关错误",
    description: "服务器作为网关或代理，从上游服务器收到了无效响应。",
    icon: Server,
    color: "text-red-600",
  },
  503: {
    title: "服务不可用",
    description: "服务器暂时无法处理请求，请稍后重试。",
    icon: Server,
    color: "text-yellow-600",
  },
};

export default function StatusPage() {
  const params = useParams();
  const status = params?.status as string;
  const statusCode = status ? (parseInt(status, 10) as StatusCode) : null;

  // Validate status code
  if (!statusCode || !statusMessages[statusCode]) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">无效的状态码</h1>
          <p className="text-muted-foreground mb-8">
            请使用有效的 HTTP 状态码（400, 401, 403, 404, 500, 502, 503）
          </p>
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = statusMessages[statusCode];
  const Icon = statusInfo.icon;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16">
      <div className="text-center max-w-2xl">
        {/* Status Code */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div
              className={`absolute inset-0 bg-gradient-to-r from-current to-current rounded-full blur-2xl opacity-20 ${statusInfo.color}`}
            />
            <div className="relative flex items-center justify-center gap-4">
              <Icon className={`h-16 w-16 ${statusInfo.color}`} />
              <h1 className={`text-7xl font-bold ${statusInfo.color}`}>
                {statusCode}
              </h1>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-4 text-foreground">
          {statusInfo.title}
        </h2>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8">
          {statusInfo.description}
        </p>

        {/* Status-specific actions */}
        <StatusActions statusCode={statusCode} />
      </div>
    </div>
  );
}
