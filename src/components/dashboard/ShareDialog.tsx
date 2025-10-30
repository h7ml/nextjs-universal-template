// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P1-LD-012] Dashboard分享对话框;
// 应用的原则: UI组件化, 用户体验;
// }}
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface ShareDialogProps {
  dashboardId: string;
  isOpen: boolean;
  onClose: () => void;
  onShare?: (config: ShareConfig) => Promise<ShareResult>;
}

export interface ShareConfig {
  isPublic: boolean;
  allowEmbed: boolean;
  requirePassword: boolean;
  password?: string;
  expiresIn?: number;
}

export interface ShareResult {
  shareId: string;
  shareUrl: string;
  embedUrl?: string;
}

/**
 * Dashboard 分享对话框
 */
export function ShareDialog({ dashboardId, isOpen, onClose, onShare }: ShareDialogProps) {
  const [config, setConfig] = useState<ShareConfig>({
    isPublic: true,
    allowEmbed: true,
    requirePassword: false,
  });
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'url' | 'embed' | null>(null);

  const handleShare = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (onShare) {
        const result = await onShare(config);
        setShareResult(result);
      } else {
        // 默认实现
        const response = await fetch(`/api/dashboard/${dashboardId}/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        });

        if (!response.ok) {
          throw new Error('Failed to create share');
        }

        const data = await response.json();
        setShareResult(data.share);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'url' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            分享 Dashboard
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {!shareResult ? (
          /* 配置表单 */
          <div className="space-y-4">
            {/* 公开访问 */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.isPublic}
                onChange={(e) => setConfig({ ...config, isPublic: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">公开访问</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  任何人都可以通过链接访问
                </div>
              </div>
            </label>

            {/* 允许嵌入 */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.allowEmbed}
                onChange={(e) => setConfig({ ...config, allowEmbed: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">允许嵌入</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  可以在其他网站嵌入此Dashboard
                </div>
              </div>
            </label>

            {/* 密码保护 */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={config.requirePassword}
                  onChange={(e) => setConfig({ ...config, requirePassword: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">密码保护</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    访问时需要输入密码
                  </div>
                </div>
              </label>
              {config.requirePassword && (
                <input
                  type="password"
                  placeholder="输入密码"
                  value={config.password || ''}
                  onChange={(e) => setConfig({ ...config, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 按钮 */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleShare}
                disabled={isLoading}
                className={cn(
                  'flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isLoading ? '创建中...' : '创建分享链接'}
              </button>
            </div>
          </div>
        ) : (
          /* 分享结果 */
          <div className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
              ✓ 分享链接已创建
            </div>

            {/* 分享链接 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                分享链接
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareResult.shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={() => copyToClipboard(shareResult.shareUrl, 'url')}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {copied === 'url' ? '✓ 已复制' : '复制'}
                </button>
              </div>
            </div>

            {/* 嵌入代码 */}
            {shareResult.embedUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  嵌入代码
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`<iframe src="${shareResult.embedUrl}" width="100%" height="600" frameborder="0"></iframe>`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `<iframe src="${shareResult.embedUrl}" width="100%" height="600" frameborder="0"></iframe>`,
                        'embed'
                      )
                    }
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {copied === 'embed' ? '✓ 已复制' : '复制'}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              完成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
