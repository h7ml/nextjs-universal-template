// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P1-LD-004] 新增雷达图组件;
// 应用的原则: 组件化, 数据驱动;
// }}
'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

export interface RadarChartProps {
  data: Array<{
    name: string;
    value: number[];
  }>;
  indicators: Array<{
    name: string;
    max: number;
  }>;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function RadarChart({ data, indicators, title, className, style }: RadarChartProps) {
  const option: EChartsOption = {
    title: title ? { text: title, left: 'center' } : undefined,
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map((item) => item.name),
    },
    radar: {
      indicator: indicators,
      shape: 'circle',
      splitNumber: 5,
      splitLine: {
        lineStyle: {
          color: ['#ddd', '#ddd', '#ddd', '#ddd', '#ddd'],
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(114, 172, 209, 0.2)', 'rgba(114, 172, 209, 0.4)'],
        },
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(114, 172, 209, 0.5)',
        },
      },
    },
    series: [
      {
        type: 'radar',
        data: data.map((item) => ({
          name: item.name,
          value: item.value,
        })),
        areaStyle: {
          opacity: 0.3,
        },
      },
    ],
  };

  return <ReactECharts option={option} className={className} style={{ height: '100%', ...style }} />;
}
