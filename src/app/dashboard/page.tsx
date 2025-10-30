"use client";

import { trpc } from "@/lib/trpc/client";
import { EChartsChart } from "@/components/charts";
import { RechartsChart } from "@/components/charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type { EChartsOption } from "echarts";

export default function DashboardPage() {
  // Example data
  const lineData = [
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

  // ECharts option example
  const lineChartOption: EChartsOption = {
    title: {
      text: "销售趋势",
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: lineData.map((item) => item.name),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "销售额",
        type: "line",
        data: lineData.map((item) => item.value),
        smooth: true,
      },
    ],
  };

  const barChartOption: EChartsOption = {
    title: {
      text: "月度销售",
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: lineData.map((item) => item.name),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "销售额",
        type: "bar",
        data: lineData.map((item) => item.sales),
      },
    ],
  };

  return (
    <div className="container mx-auto p-6 space-y-8 page-transition">
      {/* Header Section */}
      <div className="animate-fade-in-up">
        <div className="inline-block mb-2">
          <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          数据看板
        </h1>
        <p className="text-lg text-muted-foreground">实时数据可视化和分析</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ECharts Line Chart */}
        <Card className="hover-lift animate-fade-in-up stagger-1 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              ECharts 折线图
            </CardTitle>
            <CardDescription>使用 ECharts 展示的趋势图</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <EChartsChart option={lineChartOption} height={400} />
          </CardContent>
        </Card>

        {/* ECharts Bar Chart */}
        <Card className="hover-lift animate-fade-in-up stagger-2 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              ECharts 柱状图
            </CardTitle>
            <CardDescription>月度销售数据</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <EChartsChart option={barChartOption} height={400} />
          </CardContent>
        </Card>

        {/* Recharts Line Chart */}
        <Card className="hover-lift animate-fade-in-up stagger-3 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Recharts 折线图
            </CardTitle>
            <CardDescription>使用 Recharts 展示的数据</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <RechartsChart
              type="line"
              data={lineData}
              keys={["value", "sales"]}
              height={300}
            />
          </CardContent>
        </Card>

        {/* Recharts Pie Chart */}
        <Card className="hover-lift animate-fade-in-up stagger-4 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
              Recharts 饼图
            </CardTitle>
            <CardDescription>设备分布统计</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <RechartsChart
              type="pie"
              data={pieData}
              keys={["value"]}
              height={300}
            />
          </CardContent>
        </Card>

        {/* Recharts Area Chart */}
        <Card className="hover-lift animate-fade-in-up stagger-5 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              Recharts 面积图
            </CardTitle>
            <CardDescription>区域填充图表</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <RechartsChart
              type="area"
              data={lineData}
              keys={["value"]}
              height={300}
            />
          </CardContent>
        </Card>

        {/* Recharts Bar Chart */}
        <Card className="hover-lift animate-fade-in-up overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              Recharts 柱状图
            </CardTitle>
            <CardDescription>对比数据展示</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <RechartsChart
              type="bar"
              data={lineData}
              keys={["value", "sales"]}
              height={300}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
