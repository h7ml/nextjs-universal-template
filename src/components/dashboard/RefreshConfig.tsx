// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P1-LD-011] Dashboard刷新配置组件;
// 应用的原则: UI组件化, 用户体验;
// }}
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface RefreshConfigProps {
  /** 当前刷新间隔（秒） */
  interval: number;
  /** 刷新间隔变化回调 */
  onIntervalChange: (interval: number) => void;
  /** 是否暂停 */
  isPaused: boolean;
  /** 暂停/恢复回调 */
  onPauseToggle: () => void;
  /** 手动刷新回调 */
  onManualRefresh: () => void;
  /** 是否正在刷新 */
  isRefreshing?: boolean;
  className?: string;
}

const REFRESH_INTERVALS = [
  { label: '实时', value: 0 },
  { label: '5秒', value: 5 },
  { label: '10秒', value: 10 },
  { label: '30秒', value: 30 },
  { label: '1分钟', value: 60 },
  { label: '5分钟', value: 300 },
  { label: '关闭', value: -1 },
];

/**
 * Dashboard 刷新配置组件
 * 
 * 提供刷新间隔设置、暂停/恢复、手动刷新功能
 */
export function RefreshConfig({
  interval,
  onIntervalChange,
  isPaused,
  onPauseToggle,
  onManualRefresh,
  isRefreshing = false,
  className,
}: RefreshConfigProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentIntervalLabel =
    REFRESH_INTERVALS.find((item) => item.value === interval)?.label || '自定义';

  return (
    <div className={cn('relative inline-block', className)}>
      {/* 主按钮 */}
      <div className="flex items-center gap-2">
        {/* 刷新间隔选择 */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex items-center gap-2 px-3 py-2',
              'text-sm font-medium',
              'bg-white dark:bg-gray-800',
              'border border-gray-300 dark:border-gray-600',
              'rounded-lg',
              'hover:bg-gray-50 dark:hover:bg-gray-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'transition-colors'
            )}
          >
            <svg
              className={cn('w-4 h-4', isRefreshing && 'animate-spin')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{currentIntervalLabel}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 下拉菜单 */}
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <div
                className={cn(
                  'absolute top-full left-0 mt-2 z-20',
                  'w-40',
                  'bg-white dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700',
                  'rounded-lg shadow-lg',
                  'py-1'
                )}
              >
                {REFRESH_INTERVALS.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      onIntervalChange(item.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2',
                      'text-sm',
                      'hover:bg-gray-100 dark:hover:bg-gray-700',
                      'transition-colors',
                      interval === item.value &&
                        'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 暂停/恢复按钮 */}
        {interval >= 0 && (
          <button
            onClick={onPauseToggle}
            className={cn(
              'p-2',
              'bg-white dark:bg-gray-800',
              'border border-gray-300 dark:border-gray-600',
              'rounded-lg',
              'hover:bg-gray-50 dark:hover:bg-gray-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'transition-colors'
            )}
            title={isPaused ? '恢复刷新' : '暂停刷新'}
          >
            {isPaused ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </button>
        )}

        {/* 手动刷新按钮 */}
        <button
          onClick={onManualRefresh}
          disabled={isRefreshing}
          className={cn(
            'p-2',
            'bg-white dark:bg-gray-800',
            'border border-gray-300 dark:border-gray-600',
            'rounded-lg',
            'hover:bg-gray-50 dark:hover:bg-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title="手动刷新"
        >
          <svg
            className={cn('w-4 h-4', isRefreshing && 'animate-spin')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* 状态指示器 */}
      {interval >= 0 && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {isPaused ? (
            <span>⏸️ 已暂停</span>
          ) : interval === 0 ? (
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              实时更新中
            </span>
          ) : (
            <span>每 {interval < 60 ? `${interval}秒` : `${interval / 60}分钟`} 更新</span>
          )}
        </div>
      )}
    </div>
  );
}
