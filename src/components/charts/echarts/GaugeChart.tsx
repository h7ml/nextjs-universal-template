// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P1-LD-004] 新增仪表盘图组件;
// 应用的原则: 组件化, 视觉友好;
// }}
'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

export interface GaugeChartProps {
  value: number;
  title?: string;
  min?: number;
  max?: number;
  unit?: string;
  thresholds?: Array<{
    value: number;
    color: string;
  }>;
  className?: string;
  style?: React.CSSProperties;
}

export function GaugeChart({
  value,
  title,
  min = 0,
  max = 100,
  unit = '%',
  thresholds = [
    { value: 0.2, color: '#91cc75' },
    { value: 0.8, color: '#fac858' },
    { value: 1, color: '#ee6666' },
  ],
  className,
  style,
}: GaugeChartProps) {
  const option: EChartsOption = {
    title: title ? { text: title, left: 'center' } : undefined,
    series: [
      {
        type: 'gauge',
        min,
        max,
        progress: {
          show: true,
          width: 18,
        },
        axisLine: {
          lineStyle: {
            width: 18,
            color: thresholds,
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          length: 15,
          lineStyle: {
            width: 2,
            color: '#999',
          },
        },
        axisLabel: {
          distance: 25,
          color: '#999',
          fontSize: 12,
        },
        anchor: {
          show: true,
          showAbove: true,
          size: 25,
          itemStyle: {
            borderWidth: 10,
          },
        },
        title: {
          show: false,
        },
        detail: {
          valueAnimation: true,
          fontSize: 40,
          offsetCenter: [0, '70%'],
          formatter: `{value}${unit}`,
        },
        data: [{ value }],
      },
    ],
  };

  return <ReactECharts option={option} className={className} style={{ height: '100%', ...style }} />;
}
