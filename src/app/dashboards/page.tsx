"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import Link from "next/link";

export default function DashboardsPage() {
  const router = useRouter();
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [searchName, setSearchName] = useState("");

  // Check current user
  const { data: currentUser, isLoading: userLoading } = trpc.auth.me.useQuery(
    undefined,
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Check if user is admin
  const isAdmin = !!currentUser?.roleId;

  const {
    data: dashboards,
    isLoading,
    error: listError,
    refetch,
  } = trpc.dashboard.list.useQuery(
    {
      limit,
      offset,
    },
    {
      enabled: !!currentUser, // Only fetch if logged in
      retry: false,
    }
  );

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!userLoading && (!currentUser || !isAdmin)) {
      router.push("/login");
    }
  }, [currentUser, isAdmin, userLoading, router]);

  const deleteMutation = trpc.dashboard.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("确定要删除此看板吗？")) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredDashboards = dashboards?.filter((dashboard) =>
    dashboard.name.toLowerCase().includes(searchName.toLowerCase())
  );

  // Show loading or access denied
  if (userLoading || !currentUser || !isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-2">访问受限</h2>
            <p className="text-muted-foreground mb-6">
              {userLoading
                ? "正在检查权限..."
                : "您没有权限访问此页面。需要管理员权限。"}
            </p>
            <Button asChild>
              <Link href="/login">前往登录</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (listError) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold mb-2">访问失败</h2>
            <p className="text-muted-foreground mb-6">
              {listError.message || "您没有权限访问此页面"}
            </p>
            <Button asChild>
              <Link href="/dashboard">返回看板</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 page-transition">
      {/* Header Section */}
      <div className="animate-fade-in-up">
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-block mb-2">
              <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              数据看板管理
            </h1>
            <p className="text-lg text-muted-foreground">创建和管理数据看板</p>
          </div>
          <Button
            asChild
            size="lg"
            className="animate-slide-in-right hover-lift gap-2"
          >
            <Link href="/dashboards/create">
              <span>+</span>
              创建看板
            </Link>
          </Button>
        </div>
      </div>

      <Card className="animate-fade-in-up stagger-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            看板列表
          </CardTitle>
          <CardDescription>查看和管理所有数据看板</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="relative">
              <Input
                placeholder="搜索看板..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-10 animate-fade-in"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                🔍
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-muted-foreground">
                  加载中...
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDashboards?.map((dashboard, idx) => (
                  <Card
                    key={dashboard.id}
                    className="hover-lift animate-fade-in-up overflow-hidden group"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="relative">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {dashboard.name.charAt(0)}
                        </div>
                        {dashboard.name}
                      </CardTitle>
                      <CardDescription>
                        {dashboard.description || "无描述"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">状态:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              dashboard.isPublic
                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {dashboard.isPublic ? "🌐 公开" : "🔒 私有"}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            创建时间:{" "}
                            {new Date(dashboard.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="flex-1 hover-lift"
                          >
                            <Link href={`/dashboards/${dashboard.id}`}>
                              查看
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(dashboard.id)}
                            disabled={deleteMutation.isPending}
                            className="flex-1"
                          >
                            删除
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div className="flex gap-2 justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="hover-lift"
              >
                上一页
              </Button>
              <Button
                variant="outline"
                onClick={() => setOffset(offset + limit)}
                disabled={
                  filteredDashboards && filteredDashboards.length < limit
                }
                className="hover-lift"
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
