// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P1-LD-004] 新增漏斗图组件;
// 应用的原则: 组件化, 数据可视化;
// }}
'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

export interface FunnelChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  title?: string;
  sort?: 'ascending' | 'descending' | 'none';
  className?: string;
  style?: React.CSSProperties;
}

export function FunnelChart({
  data,
  title,
  sort = 'descending',
  className,
  style,
}: FunnelChartProps) {
  const option: EChartsOption = {
    title: title ? { text: title, left: 'center' } : undefined,
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c}',
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map((item) => item.name),
    },
    series: [
      {
        name: 'Funnel',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: Math.max(...data.map((item) => item.value)),
        minSize: '0%',
        maxSize: '100%',
        sort: sort,
        gap: 2,
        label: {
          show: true,
          position: 'inside',
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid',
          },
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        emphasis: {
          label: {
            fontSize: 20,
          },
        },
        data: data.map((item) => ({
          name: item.name,
          value: item.value,
        })),
      },
    ],
  };

  return <ReactECharts option={option} className={className} style={{ height: '100%', ...style }} />;
}
