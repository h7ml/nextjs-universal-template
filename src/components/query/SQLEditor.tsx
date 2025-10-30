// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P2-LD-001] SQL查询编辑器组件;
// 应用的原则: 组件化, 开发者体验;
// }}
'use client';

import React, { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export interface SQLEditorProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  onRun?: (sql: string) => void;
  height?: string | number;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}

export function SQLEditor({
  value = '',
  onChange,
  onRun,
  height = '400px',
  readOnly = false,
  placeholder = '-- Write your SQL query here\nSELECT * FROM users LIMIT 10;',
  className,
}: SQLEditorProps) {
  const editorRef = useRef<any>(null);
  const { theme } = useTheme();
  const [isExecuting, setIsExecuting] = useState(false);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // 配置 SQL 语言
    monaco.languages.setLanguageConfiguration('sql', {
      comments: {
        lineComment: '--',
        blockComment: ['/*', '*/'],
      },
      brackets: [
        ['(', ')'],
        ['[', ']'],
      ],
      autoClosingPairs: [
        { open: '(', close: ')' },
        { open: '[', close: ']' },
        { open: "'", close: "'" },
        { open: '"', close: '"' },
      ],
    });

    // 自定义快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });

    // 代码补全（基础实现）
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: () => {
        return {
          suggestions: [
            {
              label: 'SELECT',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'SELECT ',
            },
            {
              label: 'FROM',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'FROM ',
            },
            {
              label: 'WHERE',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'WHERE ',
            },
            {
              label: 'ORDER BY',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'ORDER BY ',
            },
            {
              label: 'GROUP BY',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'GROUP BY ',
            },
            {
              label: 'LIMIT',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'LIMIT ',
            },
          ],
        };
      },
    });
  };

  const handleRun = async () => {
    const currentValue = editorRef.current?.getValue() || value;
    if (!currentValue.trim()) return;

    setIsExecuting(true);
    try {
      await onRun?.(currentValue);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleFormat = () => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
  };

  return (
    <div className={cn('sql-editor-container', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SQL Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFormat}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            title="Format SQL (Alt+Shift+F)"
          >
            Format
          </button>
          <button
            onClick={handleRun}
            disabled={isExecuting || readOnly}
            className={cn(
              'px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Run Query (Ctrl+Enter)"
          >
            {isExecuting ? (
              <>
                <svg
                  className="inline w-4 h-4 mr-1 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Running...
              </>
            ) : (
              <>▶ Run</>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <Editor
        height={height}
        defaultLanguage="sql"
        value={value || placeholder}
        onChange={onChange}
        onMount={handleEditorDidMount}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          folding: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'always',
          matchBrackets: 'always',
        }}
      />
    </div>
  );
}
