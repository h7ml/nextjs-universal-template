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
import { useState } from "react";
import Link from "next/link";

export default function UsersPage() {
  const router = useRouter();
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);

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
    data: users,
    isLoading,
    error: listError,
    refetch,
  } = trpc.user.list.useQuery(
    {
      limit,
      offset,
    },
    {
      enabled: isAdmin, // Only fetch if admin
      retry: false,
    }
  );

  // Redirect if not admin
  useEffect(() => {
    if (!userLoading && (!currentUser || !isAdmin)) {
      router.push("/login");
    }
  }, [currentUser, isAdmin, userLoading, router]);

  const deleteMutation = trpc.user.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("确定要删除此用户吗？")) {
      deleteMutation.mutate({ id });
    }
  };

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
        <div className="inline-block mb-2">
          <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          用户管理
        </h1>
        <p className="text-lg text-muted-foreground">管理系统用户和权限</p>
      </div>

      <Card className="animate-fade-in-up stagger-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            用户列表
          </CardTitle>
          <CardDescription>查看和管理所有用户</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">
                加载中...
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users?.map((user, idx) => (
                  <Card
                    key={user.id}
                    className="hover-lift animate-fade-in-up overflow-hidden group"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="relative">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {(user.name || user.username).charAt(0).toUpperCase()}
                        </div>
                        {user.name || user.username}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>{user.email}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">状态:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.isActive
                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {user.isActive ? "✓ 活跃" : "✗ 禁用"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            邮箱验证:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.emailVerified
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {user.emailVerified ? "已验证" : "未验证"}
                          </span>
                        </div>
                        {user.lastLoginAt && (
                          <div className="pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground">
                              最后登录:{" "}
                              {new Date(user.lastLoginAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="flex-1 hover-lift"
                          >
                            <Link href={`/users/${user.id}`}>查看</Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
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
                  disabled={users && users.length < limit}
                  className="hover-lift"
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
