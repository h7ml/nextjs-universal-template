// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P1-LD-002] 创建拖拽式网格布局组件;
// 应用的原则: 组件化, 可复用性;
// }}
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import RGL, { WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { cn } from '@/lib/utils';

const ReactGridLayout = WidthProvider(RGL);

export interface GridLayoutProps {
  layout: Layout[];
  onLayoutChange?: (layout: Layout[]) => void;
  children: React.ReactNode;
  className?: string;
  isDraggable?: boolean;
  isResizable?: boolean;
  cols?: number;
  rowHeight?: number;
  margin?: [number, number];
  containerPadding?: [number, number];
  compactType?: 'vertical' | 'horizontal' | null;
  preventCollision?: boolean;
  autoSize?: boolean;
}

/**
 * 拖拽式网格布局组件
 * 基于 react-grid-layout
 */
export function GridLayout({
  layout,
  onLayoutChange,
  children,
  className,
  isDraggable = true,
  isResizable = true,
  cols = 12,
  rowHeight = 80,
  margin = [16, 16],
  containerPadding = [16, 16],
  compactType = 'vertical',
  preventCollision = false,
  autoSize = true,
}: GridLayoutProps) {
  const [currentLayout, setCurrentLayout] = useState<Layout[]>(layout);

  // 布局变化处理
  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      setCurrentLayout(newLayout);
      onLayoutChange?.(newLayout);
    },
    [onLayoutChange]
  );

  // 拖拽开始
  const handleDragStart = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout) => {
    console.log('Drag started:', { oldItem, newItem });
  }, []);

  // 拖拽中
  const handleDrag = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout) => {
    // 可以在这里添加拖拽时的视觉反馈
  }, []);

  // 拖拽结束
  const handleDragStop = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout) => {
    console.log('Drag stopped:', { oldItem, newItem });
  }, []);

  // 调整大小开始
  const handleResizeStart = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout) => {
    console.log('Resize started:', { oldItem, newItem });
  }, []);

  // 调整大小中
  const handleResize = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout) => {
    // 可以在这里添加调整大小时的视觉反馈
  }, []);

  // 调整大小结束
  const handleResizeStop = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout) => {
    console.log('Resize stopped:', { oldItem, newItem });
  }, []);

  return (
    <ReactGridLayout
      className={cn('dashboard-grid-layout', className)}
      layout={currentLayout}
      onLayoutChange={handleLayoutChange}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      cols={cols}
      rowHeight={rowHeight}
      margin={margin}
      containerPadding={containerPadding}
      isDraggable={isDraggable}
      isResizable={isResizable}
      compactType={compactType}
      preventCollision={preventCollision}
      autoSize={autoSize}
      draggableHandle=".dashboard-widget-drag-handle"
      resizeHandles={['se', 'sw', 'ne', 'nw']}
    >
      {children}
    </ReactGridLayout>
  );
}

/**
 * Widget容器组件
 * 包装每个Dashboard widget
 */
export interface WidgetContainerProps {
  id: string;
  title?: string;
  isEditing?: boolean;
  onRemove?: () => void;
  onConfigure?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function WidgetContainer({
  id,
  title,
  isEditing = false,
  onRemove,
  onConfigure,
  children,
  className,
}: WidgetContainerProps) {
  return (
    <div
      key={id}
      className={cn(
        'dashboard-widget',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-lg shadow-sm',
        'flex flex-col',
        'overflow-hidden',
        'transition-shadow duration-200',
        'hover:shadow-md',
        className
      )}
    >
      {/* Widget Header */}
      {(title || isEditing) && (
        <div
          className={cn(
            'dashboard-widget-header',
            'flex items-center justify-between',
            'px-4 py-3',
            'border-b border-gray-200 dark:border-gray-700',
            'bg-gray-50 dark:bg-gray-900',
            isEditing && 'dashboard-widget-drag-handle cursor-move'
          )}
        >
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {title || 'Untitled Widget'}
          </h3>

          {isEditing && (
            <div className="flex items-center gap-2">
              {onConfigure && (
                <button
                  onClick={onConfigure}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Configure"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              )}
              {onRemove && (
                <button
                  onClick={onRemove}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  title="Remove"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Widget Content */}
      <div className="dashboard-widget-content flex-1 p-4 overflow-auto">{children}</div>
    </div>
  );
}
