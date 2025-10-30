// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P3-LD-006] 数据探索页面;
// 应用的原则: 用户体验, 数据可视化;
// }}
'use client';

import React, { useState } from 'react';
import { SchemaExplorer } from '@/components/datasource/SchemaExplorer';
import { QueryResults } from '@/components/query/QueryResults';

export default function ExplorePage() {
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null);
  const [schemas, setSchemas] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock数据源列表
  const dataSources = [
    { id: '1', name: 'Production DB', type: 'postgresql' },
    { id: '2', name: 'Analytics DB', type: 'mysql' },
    { id: '3', name: 'User Data', type: 'mongodb' },
  ];

  const handleDataSourceSelect = async (id: string) => {
    setSelectedDataSource(id);
    setIsLoading(true);
    // TODO: 调用API获取schemas
    // const result = await trpc.dataSource.getSchemas.query({ id });
    // setSchemas(result.schemas);
    setSchemas(['public', 'analytics']); // Mock
    setIsLoading(false);
  };

  const handlePreviewTable = async (tableName: string, schema?: string) => {
    if (!selectedDataSource) return;
    setIsLoading(true);
    // TODO: 调用API预览数据
    // const result = await trpc.dataSource.previewTable.query({
    //   id: selectedDataSource,
    //   tableName,
    //   schema,
    //   limit: 100,
    // });
    // setPreviewData(result.data);
    // setPreviewColumns(result.columns);
    setPreviewData([]); // Mock
    setPreviewColumns([]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Data Explorer</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Browse and explore your data sources
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Data Sources */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Data Sources</h3>
              <ul className="space-y-2">
                {dataSources.map((ds) => (
                  <li key={ds.id}>
                    <button
                      onClick={() => handleDataSourceSelect(ds.id)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors ${
                        selectedDataSource === ds.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        <div>
                          <div className="font-medium">{ds.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{ds.type}</div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-3 space-y-6">
            {selectedDataSource ? (
              <>
                <SchemaExplorer
                  dataSourceId={selectedDataSource}
                  schemas={schemas}
                  onPreviewTable={handlePreviewTable}
                />

                {(previewData.length > 0 || isLoading) && (
                  <QueryResults
                    data={previewData}
                    columns={previewColumns}
                    isLoading={isLoading}
                  />
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select a Data Source
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a data source from the left to explore its schema and data
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
