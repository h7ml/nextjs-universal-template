// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P3-LD-005] Schema探索组件;
// 应用的原则: 树形结构, 可视化;
// }}
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { SchemaTable, SchemaColumn } from '@/lib/datasource';

export interface SchemaExplorerProps {
  dataSourceId: string;
  schemas: string[];
  onSchemaSelect?: (schema: string) => void;
  onTableSelect?: (table: string, schema?: string) => void;
  onPreviewTable?: (table: string, schema?: string) => void;
  className?: string;
}

export function SchemaExplorer({
  dataSourceId,
  schemas,
  onSchemaSelect,
  onTableSelect,
  onPreviewTable,
  className,
}: SchemaExplorerProps) {
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set());
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [tables, setTables] = useState<Record<string, SchemaTable[]>>({});
  const [tableColumns, setTableColumns] = useState<Record<string, SchemaColumn[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const toggleSchema = async (schema: string) => {
    const newExpanded = new Set(expandedSchemas);
    if (newExpanded.has(schema)) {
      newExpanded.delete(schema);
    } else {
      newExpanded.add(schema);
      // 加载表列表
      if (!tables[schema]) {
        setLoading({ ...loading, [schema]: true });
        // TODO: 调用API加载表列表
        // const result = await trpc.dataSource.getTables.query({ id: dataSourceId, schema });
        // setTables({ ...tables, [schema]: result.tables });
        setLoading({ ...loading, [schema]: false });
      }
    }
    setExpandedSchemas(newExpanded);
    onSchemaSelect?.(schema);
  };

  const toggleTable = async (tableName: string, schema?: string) => {
    const key = schema ? `${schema}.${tableName}` : tableName;
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
      // 加载列信息
      if (!tableColumns[key]) {
        setLoading({ ...loading, [key]: true });
        // TODO: 调用API加载列信息
        // const result = await trpc.dataSource.getTableSchema.query({ id: dataSourceId, tableName, schema });
        // setTableColumns({ ...tableColumns, [key]: result.columns });
        setLoading({ ...loading, [key]: false });
      }
    }
    setExpandedTables(newExpanded);
    onTableSelect?.(tableName, schema);
  };

  return (
    <div className={cn('schema-explorer bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Database Explorer</h3>
      </div>

      <div className="p-2 max-h-96 overflow-y-auto">
        {schemas.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            No schemas found
          </div>
        ) : (
          <ul className="space-y-1">
            {schemas.map((schema) => (
              <li key={schema}>
                <div
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
                  onClick={() => toggleSchema(schema)}
                >
                  <span className="text-gray-500 dark:text-gray-400">
                    {expandedSchemas.has(schema) ? '▼' : '▶'}
                  </span>
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{schema}</span>
                </div>

                {expandedSchemas.has(schema) && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {loading[schema] ? (
                      <li className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">Loading...</li>
                    ) : tables[schema] ? (
                      tables[schema].map((table) => {
                        const tableKey = `${schema}.${table.name}`;
                        return (
                          <li key={tableKey}>
                            <div className="flex items-center justify-between gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors group">
                              <div
                                className="flex items-center gap-2 flex-1 cursor-pointer"
                                onClick={() => toggleTable(table.name, schema)}
                              >
                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                  {expandedTables.has(tableKey) ? '▼' : '▶'}
                                </span>
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{table.name}</span>
                                {table.rowCount !== undefined && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">({table.rowCount} rows)</span>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPreviewTable?.(table.name, schema);
                                }}
                                className="opacity-0 group-hover:opacity-100 px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-all"
                                title="Preview data"
                              >
                                Preview
                              </button>
                            </div>

                            {expandedTables.has(tableKey) && (
                              <ul className="ml-6 mt-1 space-y-1">
                                {loading[tableKey] ? (
                                  <li className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">Loading columns...</li>
                                ) : tableColumns[tableKey] ? (
                                  tableColumns[tableKey].map((column) => (
                                    <li
                                      key={column.name}
                                      className="flex items-center gap-2 px-2 py-1 text-xs text-gray-600 dark:text-gray-400"
                                    >
                                      {column.isPrimaryKey && <span className="text-yellow-500" title="Primary Key">🔑</span>}
                                      {column.isForeignKey && <span className="text-purple-500" title="Foreign Key">🔗</span>}
                                      <span className="font-mono">{column.name}</span>
                                      <span className="text-gray-500">:</span>
                                      <span className="text-blue-600 dark:text-blue-400">{column.type}</span>
                                      {!column.nullable && <span className="text-red-500" title="NOT NULL">*</span>}
                                    </li>
                                  ))
                                ) : (
                                  <li className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">No columns</li>
                                )}
                              </ul>
                            )}
                          </li>
                        );
                      })
                    ) : (
                      <li className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">No tables</li>
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
