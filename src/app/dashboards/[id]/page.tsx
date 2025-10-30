"use client";

import { EChartsChart, RechartsChart } from "@/components/charts";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type { Widget } from "@/db/schema";
import { trpc } from "@/lib/trpc/client";
import type { EChartsOption } from "echarts";
import {
  ArrowLeft,
  BarChart3,
  LineChart,
  PieChart,
  Settings,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// Edge Runtime 配置（支持多平台部署）
export const runtime = "edge";

export default function DashboardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const {
    data: dashboard,
    isLoading,
    error,
  } = trpc.dashboard.getById.useQuery(
    { id },
    {
      enabled: !!id,
      retry: false,
    }
  );

  // Widgets are included in the dashboard response
  const widgets: Widget[] = dashboard?.widgets || [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">加载中...</div>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold mb-2">看板未找到</h2>
            <p className="text-muted-foreground mb-6">
              {error?.message || "该看板不存在或您没有访问权限"}
            </p>
            <Button asChild>
              <Link href="/dashboards">返回看板列表</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate sample chart data based on widget type
  const getWidgetChartData = (widget: Widget) => {
    if (!widget) return null;

    const sampleData = [
      { name: "Jan", value: 400, sales: 2400 },
      { name: "Feb", value: 300, sales: 1398 },
      { name: "Mar", value: 200, sales: 9800 },
      { name: "Apr", value: 278, sales: 3908 },
      { name: "May", value: 189, sales: 4800 },
      { name: "Jun", value: 239, sales: 3800 },
    ];

    const pieData = [
      { name: "Desktop", value: 400 },
      { name: "Mobile", value: 300 },
      { name: "Tablet", value: 200 },
      { name: "Other", value: 100 },
    ];

    switch (widget.type) {
      case "line":
        return {
          type: "line" as const,
          data: sampleData,
          keys: ["value", "sales"],
          option: {
            title: { text: widget.title },
            tooltip: { trigger: "axis" },
            xAxis: { type: "category", data: sampleData.map((d) => d.name) },
            yAxis: { type: "value" },
            series: [
              {
                name: "数值",
                type: "line",
                data: sampleData.map((d) => d.value),
                smooth: true,
              },
            ],
          } as EChartsOption,
        };
      case "bar":
        return {
          type: "bar" as const,
          data: sampleData,
          keys: ["value", "sales"],
          option: {
            title: { text: widget.title },
            tooltip: { trigger: "axis" },
            xAxis: { type: "category", data: sampleData.map((d) => d.name) },
            yAxis: { type: "value" },
            series: [
              {
                name: "销售额",
                type: "bar",
                data: sampleData.map((d) => d.sales),
              },
            ],
          } as EChartsOption,
        };
      case "pie":
        return {
          type: "pie" as const,
          data: pieData,
          keys: ["value"],
          option: {
            title: { text: widget.title },
            tooltip: { trigger: "item" },
            series: [
              {
                name: "分布",
                type: "pie",
                data: pieData.map((d) => ({ name: d.name, value: d.value })),
              },
            ],
          } as EChartsOption,
        };
      case "area":
        return {
          type: "area" as const,
          data: sampleData,
          keys: ["value"],
        };
      default:
        return null;
    }
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case "line":
        return <LineChart className="h-5 w-5" />;
      case "bar":
        return <BarChart3 className="h-5 w-5" />;
      case "pie":
        return <PieChart className="h-5 w-5" />;
      case "area":
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 page-transition">
      {/* Header */}
      <div className="animate-fade-in-up">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <div className="inline-block mb-2">
          <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {dashboard.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              {dashboard.description || "没有描述"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              设置
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              dashboard.isPublic
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
            }`}
          >
            {dashboard.isPublic ? "🌐 公开" : "🔒 私有"}
          </span>
          <span>
            创建时间: {new Date(dashboard.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Widgets Grid */}
      {widgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {widgets
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((widget, idx) => {
              const chartData = getWidgetChartData(widget);
              return (
                <Card
                  key={widget.id}
                  className="hover-lift animate-fade-in-up overflow-hidden group"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2">
                      {getWidgetIcon(widget.type)}
                      {widget.title}
                    </CardTitle>
                    <CardDescription>类型: {widget.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    {chartData ? (
                      chartData.option ? (
                        <EChartsChart option={chartData.option} height={300} />
                      ) : (
                        <RechartsChart
                          type={chartData.type}
                          data={chartData.data}
                          keys={chartData.keys}
                          height={300}
                        />
                      )
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        无法渲染此组件类型
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">暂无组件</h3>
            <p className="text-muted-foreground mb-4">
              这个看板还没有添加任何数据可视化组件
            </p>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              添加组件
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Info */}
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>看板信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">看板 ID</div>
              <div className="font-mono text-xs">{dashboard.id}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">组件数量</div>
              <div className="font-semibold">{widgets.length || 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">创建时间</div>
              <div>{new Date(dashboard.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">更新时间</div>
              <div>{new Date(dashboard.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
