// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P2-LD-005] SQL查询页面;
// 应用的原则: 用户体验, 组件组合;
// }}
'use client';

import React, { useState } from 'react';
import { SQLEditor } from '@/components/query/SQLEditor';
import { QueryResults } from '@/components/query/QueryResults';
import { QueryHistory, QueryHistoryItem } from '@/components/query/QueryHistory';
import { trpc } from '@/lib/trpc/client';
import { log } from '@/lib/logger';

export default function QueryPage() {
  const [sql, setSql] = useState('-- Write your SQL query here\nSELECT * FROM universal_users LIMIT 10;');
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);

  const executeMutation = trpc.query.execute.useMutation();

  const handleRun = async (querySQL: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await executeMutation.mutateAsync({
        sql: querySQL,
        useCache: true,
      });

      setResults(result.data);
      setColumns(result.columns);
      setDuration(result.duration);

      // 添加到历史
      const historyItem: QueryHistoryItem = {
        id: crypto.randomUUID(),
        sql: querySQL,
        executedAt: new Date(),
        duration: result.duration,
        rowCount: result.rowCount,
        status: 'success',
        isFavorite: false,
      };
      setHistory((prev) => [historyItem, ...prev]);

      log.info({ cached: result.cached, rowCount: result.rowCount }, 'Query executed successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Query execution failed';
      setError(errorMessage);

      // 添加失败记录到历史
      const historyItem: QueryHistoryItem = {
        id: crypto.randomUUID(),
        sql: querySQL,
        executedAt: new Date(),
        status: 'error',
        error: errorMessage,
        isFavorite: false,
      };
      setHistory((prev) => [historyItem, ...prev]);

      log.error({ error: errorMessage }, 'Query execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: QueryHistoryItem) => {
    setSql(item.sql);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">SQL Query Editor</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Execute SQL queries against your database
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor Area */}
          <div className="lg:col-span-2 space-y-6">
            <SQLEditor
              value={sql}
              onChange={(value) => setSql(value || '')}
              onRun={handleRun}
              height="400px"
            />

            <QueryResults
              data={results}
              columns={columns}
              isLoading={isLoading}
              error={error}
              duration={duration}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <QueryHistory
              history={history}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
