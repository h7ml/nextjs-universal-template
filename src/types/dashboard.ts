// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P1-LD-001] Dashboard类型定义;
// 应用的原则: 类型安全, 接口隔离;
// }}
import type { Layout } from 'react-grid-layout';

/**
 * 图表类型枚举
 */
export type ChartType =
  // ECharts
  | 'line'
  | 'bar'
  | 'pie'
  | 'scatter'
  | 'radar'
  | 'funnel'
  | 'gauge'
  | 'heatmap'
  | 'sankey'
  | 'map'
  | 'candlestick'
  | 'boxplot'
  // Recharts
  | 'area'
  | 'composed'
  | 'treemap'
  | 'radialBar'
  // 其他
  | 'table'
  | 'stat'
  | 'text';

/**
 * 图表配置
 */
export interface ChartConfig {
  type: ChartType;
  title?: string;
  description?: string;
  dataSource?: {
    type: 'static' | 'api' | 'query';
    config: Record<string, any>;
  };
  options?: Record<string, any>;
  refreshInterval?: number; // 秒
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * Widget定义
 */
export interface Widget {
  id: string;
  type: ChartType;
  config: ChartConfig;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
  };
  data?: any[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Dashboard定义
 */
export interface DashboardDefinition {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
  layout: Layout[];
  settings: {
    cols: number;
    rowHeight: number;
    margin?: [number, number];
    containerPadding?: [number, number];
    isDraggable?: boolean;
    isResizable?: boolean;
    autoSize?: boolean;
    compactType?: 'vertical' | 'horizontal' | null;
  };
  theme?: 'light' | 'dark' | 'auto';
  isPublic?: boolean;
  shareId?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Dashboard模板
 */
export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'analytics' | 'monitoring' | 'business' | 'custom';
  thumbnail?: string;
  widgets: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>[];
  layout: Omit<Layout, 'i'>[];
  tags?: string[];
}

/**
 * Widget操作类型
 */
export type WidgetAction =
  | { type: 'add'; widget: Widget }
  | { type: 'update'; id: string; widget: Partial<Widget> }
  | { type: 'remove'; id: string }
  | { type: 'move'; id: string; layout: Layout }
  | { type: 'batch'; actions: WidgetAction[] };

/**
 * Dashboard编辑器状态
 */
export interface DashboardEditorState {
  mode: 'view' | 'edit';
  selectedWidgetId: string | null;
  isDragging: boolean;
  isResizing: boolean;
  hasUnsavedChanges: boolean;
}

/**
 * 分享配置
 */
export interface ShareConfig {
  isPublic: boolean;
  shareId: string;
  allowEmbed: boolean;
  requirePassword: boolean;
  password?: string;
  expiresAt?: Date;
  viewCount?: number;
}
