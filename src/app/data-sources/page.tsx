"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/routers/_app";

const dataSourceTypes = [
  { value: "api", label: "API 接口" },
  { value: "static", label: "静态数据" },
  { value: "query", label: "数据库查询" },
  { value: "custom", label: "自定义" },
];

type DataSource = inferRouterOutputs<AppRouter>["dataSource"]["list"][number];

type JsonInputState = {
  config: string;
  data: string;
};

type FormState = {
  name: string;
  type: string;
} & JsonInputState;

const createDefaultFormState = (): FormState => ({
  name: "",
  type: dataSourceTypes[0]?.value ?? "api",
  config: "{}",
  data: "",
});

function parseJsonInput(value: string, fallback: unknown) {
  if (!value.trim()) return fallback;
  return JSON.parse(value);
}

export default function DataSourcesPage() {
  const router = useRouter();
  const [limit] = useState(20);
  const [offset] = useState(0);
  const [search, setSearch] = useState("");
  const [formState, setFormState] = useState<FormState>(createDefaultFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<FormState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const { data: currentUser, isLoading: userLoading } = trpc.auth.me.useQuery(
    undefined,
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const isAdmin = useMemo(() => !!currentUser?.roleId, [currentUser?.roleId]);

  useEffect(() => {
    if (!userLoading && (!currentUser || !isAdmin)) {
      router.push("/login");
    }
  }, [currentUser, isAdmin, router, userLoading]);

  const {
    data: dataSources,
    isLoading,
    error,
    refetch,
  } = trpc.dataSource.list.useQuery(
    { limit, offset, search: search.trim() || undefined },
    {
      enabled: !!currentUser && isAdmin,
      retry: false,
    }
  );

  const createMutation = trpc.dataSource.create.useMutation({
    onSuccess: () => {
      setFormState(createDefaultFormState());
      setFormError(null);
      refetch();
    },
    onError: (mutationError) => {
      setFormError(mutationError.message);
    },
  });

  const updateMutation = trpc.dataSource.update.useMutation({
    onSuccess: () => {
      setEditingId(null);
      setEditState(null);
      setEditError(null);
      refetch();
    },
    onError: (mutationError) => {
      setEditError(mutationError.message);
    },
  });

  const deleteMutation = trpc.dataSource.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleFormChange = (key: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    if (formError) {
      setFormError(null);
    }
  };

  const handleCreate = () => {
    try {
      const config = parseJsonInput(formState.config, {});
      const data = formState.data.trim()
        ? parseJsonInput(formState.data, {})
        : undefined;

      createMutation.mutate({
        name: formState.name.trim(),
        type: formState.type,
        config,
        data,
      });
    } catch (err) {
      setFormError("配置或数据必须是有效的 JSON 格式");
    }
  };

  const startEditing = (source: DataSource) => {
    setEditingId(source.id);
    setEditState({
      name: source.name,
      type: source.type,
      config: JSON.stringify(source.config ?? {}, null, 2),
      data:
        source.data !== null && source.data !== undefined
          ? JSON.stringify(source.data, null, 2)
          : "",
    });
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditState(null);
    setEditError(null);
  };

  const handleEditChange = (key: keyof FormState, value: string) => {
    setEditState((prev) => (prev ? { ...prev, [key]: value } : prev));
    if (editError) {
      setEditError(null);
    }
  };

  const handleUpdate = () => {
    if (!editingId || !editState) {
      return;
    }

    try {
      const config = parseJsonInput(editState.config, {});
      const data = editState.data.trim()
        ? parseJsonInput(editState.data, {})
        : undefined;

      updateMutation.mutate({
        id: editingId,
        name: editState.name.trim(),
        type: editState.type,
        config,
        data,
      });
    } catch (err) {
      setEditError("配置或数据必须是有效的 JSON 格式");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除此数据源吗？")) {
      deleteMutation.mutate({ id });
    }
  };

  if (userLoading || !currentUser || !isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center space-y-4">
            <div className="text-6xl">🔒</div>
            <h2 className="text-2xl font-bold">访问受限</h2>
            <p className="text-muted-foreground">
              {userLoading ? "正在检查权限..." : "您没有权限访问此页面。"}
            </p>
            <Button asChild>
              <Link href="/login">前往登录</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center space-y-4">
            <div className="text-6xl">😕</div>
            <h2 className="text-2xl font-bold">加载失败</h2>
            <p className="text-muted-foreground">{error.message}</p>
            <Button onClick={() => refetch()}>重新加载</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 page-transition">
      <div className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="inline-block mb-2">
              <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              数据源管理
            </h1>
            <p className="text-lg text-muted-foreground">
              统一管理仪表盘所需的数据源
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <Input
              placeholder="搜索数据源..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="md:w-64"
            />
            <Button variant="outline" onClick={() => refetch()}>
              刷新
            </Button>
          </div>
        </div>
      </div>

      <Card className="animate-fade-in-up stagger-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            新建数据源
          </CardTitle>
          <CardDescription>支持 API、静态 JSON 或自定义配置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">名称</label>
              <Input
                placeholder="输入数据源名称"
                value={formState.name}
                onChange={(event) => handleFormChange("name", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">类型</label>
              <select
                value={formState.type}
                onChange={(event) => handleFormChange("type", event.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {dataSourceTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">配置（JSON）</label>
            <textarea
              value={formState.config}
              onChange={(event) => handleFormChange("config", event.target.value)}
              className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder='{ "endpoint": "https://api.example.com" }'
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">默认数据（可选，JSON）</label>
            <textarea
              value={formState.data}
              onChange={(event) => handleFormChange("data", event.target.value)}
              className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="[]"
            />
          </div>
          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}
          <Button
            onClick={handleCreate}
            disabled={createMutation.isLoading || !formState.name.trim()}
            className="w-full md:w-auto"
          >
            {createMutation.isLoading ? "创建中..." : "创建数据源"}
          </Button>
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up stagger-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            数据源列表
          </CardTitle>
          <CardDescription>查看、编辑和删除现有数据源</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">加载中...</div>
          ) : dataSources && dataSources.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {dataSources.map((source, index) => {
                const isEditing = editingId === source.id;
                return (
                  <Card
                    key={source.id}
                    className="relative overflow-hidden hover-lift animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 hover:opacity-100" />
                    <CardContent className="relative space-y-4 pt-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold flex items-center gap-3">
                            <span className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {source.name.charAt(0).toUpperCase()}
                            </span>
                            {source.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">类型：{source.type}</p>
                        </div>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <Button variant="outline" onClick={cancelEditing}>
                                取消
                              </Button>
                              <Button onClick={handleUpdate} disabled={updateMutation.isLoading}>
                                {updateMutation.isLoading ? "保存中..." : "保存"}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="outline" onClick={() => startEditing(source)}>
                                编辑
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(source.id)}
                                disabled={deleteMutation.isLoading}
                              >
                                删除
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">名称</label>
                              <Input
                                value={editState?.name ?? ""}
                                onChange={(event) =>
                                  handleEditChange("name", event.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">类型</label>
                              <select
                                value={editState?.type ?? dataSourceTypes[0]?.value}
                                onChange={(event) =>
                                  handleEditChange("type", event.target.value)
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                              >
                                {dataSourceTypes.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">配置（JSON）</label>
                            <textarea
                              value={editState?.config ?? "{}"}
                              onChange={(event) =>
                                handleEditChange("config", event.target.value)
                              }
                              className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">默认数据（JSON）</label>
                            <textarea
                              value={editState?.data ?? ""}
                              onChange={(event) =>
                                handleEditChange("data", event.target.value)
                              }
                              className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          {editError && (
                            <p className="text-sm text-destructive">{editError}</p>
                          )}
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">配置</h4>
                            <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted/50 p-3 text-xs">
                              {JSON.stringify(source.config ?? {}, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">默认数据</h4>
                            <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted/50 p-3 text-xs">
                              {source.data !== null && source.data !== undefined
                                ? JSON.stringify(source.data, null, 2)
                                : "无"}
                            </pre>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              暂无数据源，创建一个新数据源开始吧。
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

