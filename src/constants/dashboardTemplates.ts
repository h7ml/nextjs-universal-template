// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P1-LD-007] Dashboard模板定义;
// 应用的原则: 数据驱动, 可配置化;
// }}
import type { DashboardTemplate } from '@/types/dashboard';

/**
 * Dashboard模板库
 */
export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'sales-analytics',
    name: '销售分析看板',
    description: '实时监控销售数据，包括收入趋势、产品分布、地区对比等',
    category: 'business',
    thumbnail: '/templates/sales.png',
    tags: ['sales', 'revenue', 'analytics'],
    widgets: [
      {
        type: 'line',
        config: {
          type: 'line',
          title: '月度收入趋势',
          description: '近12个月收入变化',
          dataSource: {
            type: 'api',
            config: { endpoint: '/api/sales/revenue' },
          },
          refreshInterval: 300,
        },
        layout: { x: 0, y: 0, w: 8, h: 3, minW: 4, minH: 2 },
      },
      {
        type: 'pie',
        config: {
          type: 'pie',
          title: '产品销售占比',
          dataSource: {
            type: 'api',
            config: { endpoint: '/api/sales/products' },
          },
        },
        layout: { x: 8, y: 0, w: 4, h: 3, minW: 3, minH: 2 },
      },
      {
        type: 'bar',
        config: {
          type: 'bar',
          title: '地区销售对比',
          dataSource: {
            type: 'api',
            config: { endpoint: '/api/sales/regions' },
          },
        },
        layout: { x: 0, y: 3, w: 6, h: 3, minW: 4, minH: 2 },
      },
      {
        type: 'gauge',
        config: {
          type: 'gauge',
          title: '本月目标达成率',
          dataSource: {
            type: 'api',
            config: { endpoint: '/api/sales/target' },
          },
        },
        layout: { x: 6, y: 3, w: 3, h: 3, minW: 2, minH: 2 },
      },
      {
        type: 'funnel',
        config: {
          type: 'funnel',
          title: '销售漏斗',
          dataSource: {
            type: 'api',
            config: { endpoint: '/api/sales/funnel' },
          },
        },
        layout: { x: 9, y: 3, w: 3, h: 3, minW: 2, minH: 2 },
      },
    ],
    layout: [
      { i: '0', x: 0, y: 0, w: 8, h: 3 },
      { i: '1', x: 8, y: 0, w: 4, h: 3 },
      { i: '2', x: 0, y: 3, w: 6, h: 3 },
      { i: '3', x: 6, y: 3, w: 3, h: 3 },
      { i: '4', x: 9, y: 3, w: 3, h: 3 },
    ],
  },
  {
    id: 'user-behavior',
    name: '用户行为分析',
    description: '深入了解用户行为模式，优化产品体验',
    category: 'analytics',
    thumbnail: '/templates/user-behavior.png',
    tags: ['user', 'behavior', 'engagement'],
    widgets: [
      {
        type: 'line',
        config: {
          type: 'line',
          title: '日活跃用户（DAU）',
          dataSource: {
            type: 'api',
            config: { endpoint: '/api/users/dau' },
          },
        },
        layout: { x: 0, y: 0, w: 6, h: 3 },
      },
      {
        type: 'radar',
        config: {
          type: 'radar',
          title: '用户画像',
          dataSource: {
            type: 'api',
            config: { endpoint: '/api/users/profile' },
          },
        },
        layout: { x: 6, y: 0, w: 6, h: 3 },
      },
      {
        type: 'scatter',
        config: {
          type: 'scatter',
          title: '用户留存vs活跃度',
          dataSource: {
            type: 'api',
            config: { endpoint: '/api/users/retention' },
          },
        },
        layout: { x: 0, y: 3, w: 12, h: 3 },
      },
    ],
    layout: [
      { i: '0', x: 0, y: 0, w: 6, h: 3 },
      { i: '1', x: 6, y: 0, w: 6, h: 3 },
      { i: '2', x: 0, y: 3, w: 12, h: 3 },
    ],
  },
  {
    id: 'system-monitoring',
    name: '系统监控看板',
    description: '实时监控系统性能和健康状况',
    category: 'monitoring',
    thumbnail: '/templates/monitoring.png',
    tags: ['system', 'performance', 'health'],
    widgets: [
      {
        type: 'gauge',
        config: {
          type: 'gauge',
          title: 'CPU使用率',
          dataSource: {
            type: 'api',
            config: { endpoint: '/api/system/cpu' },
          },
          refreshInterval: 5,
        },
        layout: { x: 0, y: 0, w: 3, h: 2 },
      },
      {
        type: 'gauge',
        config: {
          type: 'gauge',
          title: '内存使用率',
          dataSource: {
            type: 'api',
            config: { endpoint: '/api/system/memory' },
          },
          refreshInterval: 5,
        },
        layout: { x: 3, y: 0, w: 3, h: 2 },
      },
      {
        type: 'gauge',
        config: {
          type: 'gauge',
          title: '磁盘使用率',
          dataSource: {
            type: 'api',
            config: { endpoint: '/api/system/disk' },
          },
          refreshInterval: 30,
        },
        layout: { x: 6, y: 0, w: 3, h: 2 },
      },
      {
        type: 'gauge',
        config: {
          type: 'gauge',
          title: '网络流量',
          dataSource: {
            type: 'api',
            config: { endpoint: '/api/system/network' },
          },
          refreshInterval: 5,
        },
        layout: { x: 9, y: 0, w: 3, h: 2 },
      },
      {
        type: 'line',
        config: {
          type: 'line',
          title: '响应时间趋势',
          dataSource: {
            type: 'api',
            config: { endpoint: '/api/system/response-time' },
          },
          refreshInterval: 10,
        },
        layout: { x: 0, y: 2, w: 12, h: 3 },
      },
    ],
    layout: [
      { i: '0', x: 0, y: 0, w: 3, h: 2 },
      { i: '1', x: 3, y: 0, w: 3, h: 2 },
      { i: '2', x: 6, y: 0, w: 3, h: 2 },
      { i: '3', x: 9, y: 0, w: 3, h: 2 },
      { i: '4', x: 0, y: 2, w: 12, h: 3 },
    ],
  },
  {
    id: 'blank',
    name: '空白看板',
    description: '从头开始创建自定义看板',
    category: 'custom',
    tags: ['blank', 'custom'],
    widgets: [],
    layout: [],
  },
];

/**
 * 根据类别获取模板
 */
export function getTemplatesByCategory(
  category: DashboardTemplate['category']
): DashboardTemplate[] {
  return DASHBOARD_TEMPLATES.filter((template) => template.category === category);
}

/**
 * 根据ID获取模板
 */
export function getTemplateById(id: string): DashboardTemplate | undefined {
  return DASHBOARD_TEMPLATES.find((template) => template.id === id);
}

/**
 * 搜索模板
 */
export function searchTemplates(query: string): DashboardTemplate[] {
  const lowerQuery = query.toLowerCase();
  return DASHBOARD_TEMPLATES.filter(
    (template) =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}
