// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P1-LD-010] 客户端SSE集成Hook;
// 应用的原则: React Hooks, 自动管理连接;
// }}
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { log } from '@/lib/logger';

export interface DashboardStreamData {
  dashboardId: string;
  timestamp: string;
  data: any;
  updateCount?: number;
}

export interface UseDashboardStreamOptions {
  /** Dashboard ID */
  dashboardId: string;
  /** 是否启用（默认 true） */
  enabled?: boolean;
  /** 重连间隔（毫秒，默认 3000） */
  reconnectInterval?: number;
  /** 最大重连次数（默认 5） */
  maxReconnectAttempts?: number;
  /** 数据更新回调 */
  onUpdate?: (data: DashboardStreamData) => void;
  /** 连接状态变化回调 */
  onConnectionChange?: (connected: boolean) => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
}

export interface UseDashboardStreamReturn {
  /** 最新数据 */
  data: DashboardStreamData | null;
  /** 连接状态 */
  connected: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 手动重连 */
  reconnect: () => void;
  /** 断开连接 */
  disconnect: () => void;
}

/**
 * Dashboard 实时数据流 Hook
 * 
 * 使用 Server-Sent Events (SSE) 接收实时数据更新
 * 
 * @example
 * ```tsx
 * const { data, connected, error, reconnect } = useDashboardStream({
 *   dashboardId: 'dashboard-1',
 *   onUpdate: (data) => {
 *     console.log('Dashboard updated:', data);
 *   },
 * });
 * 
 * if (error) return <div>Error: {error.message}</div>;
 * if (!connected) return <div>Connecting...</div>;
 * return <div>Latest data: {JSON.stringify(data)}</div>;
 * ```
 */
export function useDashboardStream({
  dashboardId,
  enabled = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
  onUpdate,
  onConnectionChange,
  onError,
}: UseDashboardStreamOptions): UseDashboardStreamReturn {
  const [data, setData] = useState<DashboardStreamData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 清理函数
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // 连接函数
  const connect = useCallback(() => {
    if (!enabled || !dashboardId) return;

    cleanup();

    try {
      log.info('Connecting to dashboard stream', { dashboardId });

      const eventSource = new EventSource(`/api/dashboard/${dashboardId}/stream`);
      eventSourceRef.current = eventSource;

      // 连接成功
      eventSource.addEventListener('connected', (event) => {
        log.info('Dashboard stream connected', { dashboardId });
        const data = JSON.parse(event.data);
        
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        onConnectionChange?.(true);
      });

      // 数据更新
      eventSource.addEventListener('data-update', (event) => {
        const updateData: DashboardStreamData = JSON.parse(event.data);
        
        setData(updateData);
        onUpdate?.(updateData);
      });

      // 连接打开
      eventSource.onopen = () => {
        log.info('EventSource opened', { dashboardId });
      };

      // 错误处理
      eventSource.onerror = (event) => {
        const err = new Error('Dashboard stream connection error');
        log.error('Dashboard stream error', { error: err, dashboardId });

        setConnected(false);
        setError(err);
        onConnectionChange?.(false);
        onError?.(err);

        eventSource.close();

        // 自动重连
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          log.info('Attempting to reconnect', {
            attempt: reconnectAttemptsRef.current,
            maxAttempts: maxReconnectAttempts,
            dashboardId,
          });

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          log.error('Max reconnect attempts reached', {
            maxAttempts: maxReconnectAttempts,
            dashboardId,
          });
        }
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect to dashboard stream');
      log.error('Failed to create EventSource', { error, dashboardId });
      setError(error);
      onError?.(error);
    }
  }, [
    enabled,
    dashboardId,
    reconnectInterval,
    maxReconnectAttempts,
    onUpdate,
    onConnectionChange,
    onError,
    cleanup,
  ]);

  // 手动重连
  const reconnect = useCallback(() => {
    log.info('Manual reconnect triggered', { dashboardId });
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect, dashboardId]);

  // 断开连接
  const disconnect = useCallback(() => {
    log.info('Disconnecting from dashboard stream', { dashboardId });
    cleanup();
    setConnected(false);
    setData(null);
    onConnectionChange?.(false);
  }, [cleanup, dashboardId, onConnectionChange]);

  // 初始连接和清理
  useEffect(() => {
    connect();
    return cleanup;
  }, [connect, cleanup]);

  return {
    data,
    connected,
    error,
    reconnect,
    disconnect,
  };
}
