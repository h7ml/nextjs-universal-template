// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P1-LD-009] 实现SSE实时数据推送;
// 应用的原则: 实时通信, 自动重连;
// }}
import { NextRequest } from 'next/server';
import { log } from '@/lib/logger';

/**
 * Server-Sent Events (SSE) 实时数据流
 * 
 * 使用方式:
 * const eventSource = new EventSource('/api/dashboard/[id]/stream');
 * eventSource.onmessage = (event) => {
 *   const data = JSON.parse(event.data);
 * };
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const dashboardId = params.id;

  log.info('SSE stream started', { dashboardId });

  // 创建一个 TransformStream 用于 SSE
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // 发送 SSE 消息的辅助函数
  const sendEvent = async (event: string, data: any) => {
    try {
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      await writer.write(encoder.encode(message));
    } catch (error) {
      log.error('Failed to send SSE event', { error, event, dashboardId });
    }
  };

  // 发送心跳的辅助函数
  const sendHeartbeat = async () => {
    try {
      await writer.write(encoder.encode(': heartbeat\n\n'));
    } catch (error) {
      log.error('Failed to send heartbeat', { error, dashboardId });
    }
  };

  // 启动数据推送
  (async () => {
    try {
      // 发送初始连接消息
      await sendEvent('connected', {
        dashboardId,
        timestamp: new Date().toISOString(),
        message: 'Connected to dashboard stream',
      });

      // 模拟数据更新（实际应用中应该监听数据库变更或其他数据源）
      let counter = 0;
      const interval = setInterval(async () => {
        counter++;

        // 发送数据更新事件
        await sendEvent('data-update', {
          dashboardId,
          timestamp: new Date().toISOString(),
          data: {
            // 这里应该是实际的Dashboard数据
            // 可以从数据库查询或缓存获取
            widgets: [
              {
                id: 'widget-1',
                value: Math.random() * 100,
                trend: Math.random() > 0.5 ? 'up' : 'down',
              },
              {
                id: 'widget-2',
                value: Math.random() * 1000,
                trend: Math.random() > 0.5 ? 'up' : 'down',
              },
            ],
            updateCount: counter,
          },
        });

        // 每30秒发送一次心跳
        if (counter % 6 === 0) {
          await sendHeartbeat();
        }
      }, 5000); // 每5秒更新一次数据

      // 监听请求中断
      request.signal.addEventListener('abort', () => {
        log.info('SSE stream closed by client', { dashboardId });
        clearInterval(interval);
        writer.close();
      });
    } catch (error) {
      log.error('SSE stream error', { error, dashboardId });
      await writer.close();
    }
  })();

  // 返回 SSE 响应
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // 禁用 Nginx 缓冲
    },
  });
}

/**
 * 配置路由为 Edge Runtime（可选）
 * Edge Runtime 更适合长连接
 */
// export const runtime = 'edge';

/**
 * 禁用静态优化
 */
export const dynamic = 'force-dynamic';
