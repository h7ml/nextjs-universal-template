// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P2-LD-002] 查询历史组件;
// 应用的原则: 用户体验, 数据持久化;
// }}
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export interface QueryHistoryItem {
  id: string;
  sql: string;
  executedAt: Date;
  duration?: number;
  rowCount?: number;
  status: 'success' | 'error';
  error?: string;
  isFavorite?: boolean;
}

export interface QueryHistoryProps {
  history: QueryHistoryItem[];
  onSelect?: (item: QueryHistoryItem) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  className?: string;
}

export function QueryHistory({
  history,
  onSelect,
  onDelete,
  onToggleFavorite,
  className,
}: QueryHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history
    .filter((item) => {
      if (filter === 'favorites' && !item.isFavorite) return false;
      if (searchTerm && !item.sql.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime());

  return (
    <div className={cn('query-history bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Query History</h3>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-3 py-1 text-sm rounded transition-colors',
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={cn(
              'px-3 py-1 text-sm rounded transition-colors',
              filter === 'favorites'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            ⭐ Favorites
          </button>
        </div>
        <input
          type="text"
          placeholder="Search queries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            No queries found
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredHistory.map((item) => (
              <li
                key={item.id}
                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                onClick={() => onSelect?.(item)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <pre className="text-sm text-gray-900 dark:text-gray-100 font-mono whitespace-pre-wrap break-words line-clamp-2">
                      {item.sql}
                    </pre>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDistanceToNow(item.executedAt, { addSuffix: true })}</span>
                      {item.duration && <span>{item.duration}ms</span>}
                      {item.rowCount !== undefined && <span>{item.rowCount} rows</span>}
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded',
                          item.status === 'success'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        )}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.(item.id);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <span className="text-yellow-500">{item.isFavorite ? '⭐' : '☆'}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(item.id);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
