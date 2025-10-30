"use client";

/**
 * ECharts Chart Component
 */

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { useMemo } from "react";

export interface EChartsChartProps {
  option: EChartsOption;
  height?: string | number;
  width?: string | number;
  loading?: boolean;
  theme?: string;
  className?: string;
  onChartReady?: (chart: any) => void;
}

export function EChartsChart({
  option,
  height = "400px",
  width = "100%",
  loading = false,
  theme,
  className,
  onChartReady,
}: EChartsChartProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedOption = useMemo(() => option, [JSON.stringify(option)]);

  return (
    <div className={className}>
      <ReactECharts
        option={memoizedOption}
        style={{ height, width }}
        theme={theme}
        showLoading={loading}
        loadingOption={{
          text: "加载中...",
          color: "#4f46e5",
          textColor: "#000",
          maskColor: "rgba(255, 255, 255, 0.8)",
          zlevel: 0,
        }}
        onChartReady={onChartReady}
      />
    </div>
  );
}
