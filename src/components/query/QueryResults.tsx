// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P2-LD-003] 查询结果展示和导出;
// 应用的原则: 数据表格, 导出功能;
// }}
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface QueryResultsProps {
  data: any[];
  columns?: string[];
  isLoading?: boolean;
  error?: string | null;
  duration?: number;
  onExport?: (format: 'csv' | 'excel' | 'json') => void;
  className?: string;
}

export function QueryResults({
  data,
  columns,
  isLoading = false,
  error = null,
  duration,
  onExport,
  className,
}: QueryResultsProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  // 自动提取列名
  const columnNames = columns || (data.length > 0 ? Object.keys(data[0]) : []);

  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    setShowExportMenu(false);

    if (onExport) {
      onExport(format);
      return;
    }

    // 默认导出实现
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    switch (format) {
      case 'csv': {
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `query-result-${timestamp}.csv`);
        break;
      }
      case 'excel': {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Query Results');
        XLSX.writeFile(wb, `query-result-${timestamp}.xlsx`);
        break;
      }
      case 'json': {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        downloadBlob(blob, `query-result-${timestamp}.json`);
        break;
      }
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <svg
            className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-600 dark:text-gray-400">Executing query...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg', className)}>
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-medium text-red-800 dark:text-red-300">Query Error</h4>
            <pre className="mt-1 text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">{error}</pre>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn('text-center py-12 text-gray-500 dark:text-gray-400', className)}>
        <svg className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p>No results</p>
      </div>
    );
  }

  return (
    <div className={cn('query-results', className)}>
      {/* Results Info */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{data.length} rows</span>
          {duration && <span>{duration}ms</span>}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Export ▼
          </button>
          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Excel
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  JSON
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-900 sticky top-0">
            <tr>
              {columnNames.map((col) => (
                <th
                  key={col}
                  className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                {columnNames.map((col) => (
                  <td
                    key={col}
                    className="px-4 py-2 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700"
                  >
                    {renderCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderCell(value: any): React.ReactNode {
  if (value === null) return <span className="text-gray-400 italic">NULL</span>;
  if (value === undefined) return <span className="text-gray-400 italic">undefined</span>;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
