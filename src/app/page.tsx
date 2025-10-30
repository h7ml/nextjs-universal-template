"use client";

import { PlatformInfo } from "@/components/PlatformInfo";
import { ApiTest } from "@/components/ApiTest";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  Rocket,
  Zap,
  Shield,
  Globe,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";

export default function Home() {
  // Check if user is logged in
  const { data: currentUser, isLoading: userLoading } = trpc.auth.me.useQuery(
    undefined,
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const isLoggedIn = !!currentUser;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="inline-flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-2xl opacity-50 animate-pulse" />
            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Rocket className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Next.js Universal Template
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          支持 Vercel、Deno Deploy 和 Cloudflare Pages 的全栈 Next.js 模板
          <br />
          <span className="text-sm">开箱即用的现代化开发体验</span>
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard">
              开始使用
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {!userLoading && !isLoggedIn && (
            <Button asChild variant="outline" size="lg">
              <Link href="/login">立即登录</Link>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>平台信息</CardTitle>
        </CardHeader>
        <CardContent>
          <PlatformInfo />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API 测试</CardTitle>
          <CardDescription>测试 API Routes 功能</CardDescription>
        </CardHeader>
        <CardContent>
          <ApiTest />
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: Zap, title: "Next.js 14", desc: "App Router + Edge Runtime" },
          { icon: Shield, title: "TypeScript", desc: "类型安全开发体验" },
          {
            icon: Globe,
            title: "多平台部署",
            desc: "Vercel / Deno / Cloudflare",
          },
          { icon: Rocket, title: "tRPC", desc: "端到端类型安全 API" },
          { icon: Shield, title: "Drizzle ORM", desc: "现代化数据库操作" },
          { icon: Zap, title: "JWT 认证", desc: "安全的用户认证系统" },
        ].map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className="relative overflow-hidden group hover:shadow-lg transition-shadow"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.desc}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Feature List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            完整的功能特性
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Next.js 14 App Router 架构",
              "TypeScript 完整支持",
              "Edge Runtime 兼容",
              "多平台部署配置（Vercel / Deno / Cloudflare）",
              "tRPC 端到端类型安全",
              "Drizzle ORM 数据库操作",
              "JWT 用户认证系统",
              "ECharts + Recharts 数据可视化",
              "Radix UI + Tailwind CSS 现代化 UI",
              "Dark/Light 主题切换",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
