// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P1-LD-012] Dashboard分享API;
// 应用的原则: RESTful API, 权限控制;
// }}
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { log } from '@/lib/logger';
import { z } from 'zod';

// 分享配置验证
const ShareConfigSchema = z.object({
  isPublic: z.boolean(),
  allowEmbed: z.boolean().optional().default(true),
  requirePassword: z.boolean().optional().default(false),
  password: z.string().optional(),
  expiresIn: z.number().optional(), // 秒
});

/**
 * 创建或更新Dashboard分享配置
 * POST /api/dashboard/[id]/share
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dashboardId = params.id;
    const body = await request.json();

    // 验证输入
    const config = ShareConfigSchema.parse(body);

    // TODO: 验证用户权限
    // const user = await getCurrentUser(request);
    // if (!user || !canAccessDashboard(user, dashboardId)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // 生成唯一的分享ID
    const shareId = nanoid(16);

    // 计算过期时间
    const expiresAt = config.expiresIn
      ? new Date(Date.now() + config.expiresIn * 1000)
      : null;

    // TODO: 保存到数据库
    // await db.insert(dashboardShares).values({
    //   dashboardId,
    //   shareId,
    //   isPublic: config.isPublic,
    //   allowEmbed: config.allowEmbed,
    //   requirePassword: config.requirePassword,
    //   password: config.password ? await hashPassword(config.password) : null,
    //   expiresAt,
    //   createdAt: new Date(),
    // });

    log.info('Dashboard share created', {
      dashboardId,
      shareId,
      isPublic: config.isPublic,
    });

    // 返回分享信息
    return NextResponse.json({
      success: true,
      share: {
        shareId,
        dashboardId,
        isPublic: config.isPublic,
        allowEmbed: config.allowEmbed,
        requirePassword: config.requirePassword,
        expiresAt: expiresAt?.toISOString(),
        shareUrl: `${request.nextUrl.origin}/public/dashboard/${shareId}`,
        embedUrl: config.allowEmbed
          ? `${request.nextUrl.origin}/embed/dashboard/${shareId}`
          : null,
      },
    });
  } catch (error) {
    log.error('Failed to create dashboard share', { error });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 获取Dashboard分享配置
 * GET /api/dashboard/[id]/share
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dashboardId = params.id;

    // TODO: 从数据库查询
    // const share = await db.query.dashboardShares.findFirst({
    //   where: eq(dashboardShares.dashboardId, dashboardId),
    // });

    // 模拟数据
    const share = {
      shareId: 'example-share-id',
      dashboardId,
      isPublic: true,
      allowEmbed: true,
      requirePassword: false,
      expiresAt: null,
      viewCount: 0,
      shareUrl: `${request.nextUrl.origin}/public/dashboard/example-share-id`,
      embedUrl: `${request.nextUrl.origin}/embed/dashboard/example-share-id`,
    };

    return NextResponse.json({ share });
  } catch (error) {
    log.error('Failed to get dashboard share', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 删除Dashboard分享
 * DELETE /api/dashboard/[id]/share
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dashboardId = params.id;

    // TODO: 验证权限并删除
    // await db.delete(dashboardShares).where(
    //   eq(dashboardShares.dashboardId, dashboardId)
    // );

    log.info('Dashboard share deleted', { dashboardId });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Failed to delete dashboard share', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
