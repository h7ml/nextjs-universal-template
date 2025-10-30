"use client";

/**
 * Recharts Chart Component Wrapper
 */

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ChartType = "line" | "bar" | "pie" | "area" | "radar" | "composed";

export interface ChartData {
  name: string;
  [key: string]: string | number;
}

export interface RechartsChartProps {
  type: ChartType;
  data: ChartData[];
  keys: string[];
  height?: number;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  colors?: string[];
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
  "#0088fe",
  "#ff00ff",
];

export function RechartsChart({
  type,
  data,
  keys,
  height = 300,
  className,
  showLegend = true,
  showGrid = true,
  colors = COLORS,
}: RechartsChartProps) {
  const chartContent = useMemo(() => {
    const commonProps = {
      data,
      height,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            {keys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
              />
            ))}
          </BarChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            {keys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        );

      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={(keys[0] || "value") as string}
              nameKey="name"
              cx="50%"
              cy="50%"
              label
              outerRadius={height / 3}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && <Legend />}
          </PieChart>
        );

      case "radar":
        return (
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            <Tooltip />
            {showLegend && <Legend />}
            {keys.map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
              />
            ))}
          </RadarChart>
        );

      case "composed":
        return (
          <ComposedChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            {keys[0] && (
              <Area
                type="monotone"
                dataKey={keys[0]}
                fill="#8884d8"
                stroke="#8884d8"
              />
            )}
            {keys[1] && <Bar dataKey={keys[1]} fill="#82ca9d" />}
            {keys[2] && (
              <Line type="monotone" dataKey={keys[2]} stroke="#ff7300" />
            )}
          </ComposedChart>
        );

      default:
        return null;
    }
  }, [type, data, keys, height, showLegend, showGrid, colors]);

  if (!chartContent) return null;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        {chartContent}
      </ResponsiveContainer>
    </div>
  );
}
