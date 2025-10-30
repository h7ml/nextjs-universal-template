// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P1-LD-004] 新增散点图组件;
// 应用的原则: 组件化, 可复用性;
// }}
'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

export interface ScatterChartProps {
  data: Array<{ name: string; value: [number, number] }>;
  title?: string;
  xAxisName?: string;
  yAxisName?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ScatterChart({
  data,
  title,
  xAxisName = 'X Axis',
  yAxisName = 'Y Axis',
  className,
  style,
}: ScatterChartProps) {
  const option: EChartsOption = {
    title: title ? { text: title, left: 'center' } : undefined,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}<br/>
                X: ${params.value[0]}<br/>
                Y: ${params.value[1]}`;
      },
    },
    xAxis: {
      name: xAxisName,
      nameLocation: 'middle',
      nameGap: 30,
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    yAxis: {
      name: yAxisName,
      nameLocation: 'middle',
      nameGap: 40,
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    series: [
      {
        type: 'scatter',
        data: data.map((item) => ({
          name: item.name,
          value: item.value,
        })),
        symbolSize: 10,
        itemStyle: {
          opacity: 0.8,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return <ReactECharts option={option} className={className} style={{ height: '100%', ...style }} />;
}
