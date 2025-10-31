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
import { db, dashboardShares, dashboards, users } from '@/db';
import type { DashboardShare } from '@/db';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyToken } from '@/server/routers/auth';

type AuthenticatedUser = Omit<typeof users.$inferSelect, 'password'>;

const MAX_EXPIRY_SECONDS = 60 * 60 * 24 * 30; // 30 days

const ShareConfigSchema = z.object({
  isPublic: z.boolean(),
  allowEmbed: z.boolean().optional().default(true),
  requirePassword: z.boolean().optional().default(false),
  password: z.string().min(8).max(128).optional(),
  expiresIn: z
    .number()
    .int()
    .positive()
    .max(MAX_EXPIRY_SECONDS)
    .optional(),
});

function formatShareResponse(share: DashboardShare, request: NextRequest) {
  return {
    shareId: share.shareId,
    dashboardId: share.dashboardId,
    isPublic: share.isPublic,
    allowEmbed: share.allowEmbed,
    requirePassword: share.requirePassword,
    expiresAt: share.expiresAt ? share.expiresAt.toISOString() : null,
    viewCount: share.viewCount,
    shareUrl: `${request.nextUrl.origin}/public/dashboard/${share.shareId}`,
    embedUrl: share.allowEmbed
      ? `${request.nextUrl.origin}/embed/dashboard/${share.shareId}`
      : null,
  };
}

async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  const authorization =
    request.headers.get('authorization') ?? request.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.slice('Bearer '.length).trim();
  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload?.userId) {
    return null;
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
  });

  if (!userRecord || !userRecord.isActive) {
    return null;
  }

  const { password, ...userWithoutPassword } = userRecord;
  return userWithoutPassword;
}

async function assertDashboardOwnership(
  dashboardId: string,
  user: AuthenticatedUser
) {
  const dashboard = await db.query.dashboards.findFirst({
    where: eq(dashboards.id, dashboardId),
  });

  if (!dashboard) {
    return { status: 404 as const, message: 'Dashboard not found' };
  }

  if (dashboard.createdBy !== user.id) {
    return { status: 403 as const, message: 'Forbidden' };
  }

  return { status: 200 as const, dashboard };
}

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
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ownership = await assertDashboardOwnership(dashboardId, user);
    if (ownership.status !== 200) {
      return NextResponse.json(
        { error: ownership.message },
        { status: ownership.status }
      );
    }

    const body = await request.json();
    const config = ShareConfigSchema.parse(body);

    const existingShare = await db.query.dashboardShares.findFirst({
      where: eq(dashboardShares.dashboardId, dashboardId),
    });

    if (config.requirePassword && !config.password && !existingShare?.passwordHash) {
      return NextResponse.json(
        { error: 'Password is required when enabling protection' },
        { status: 400 }
      );
    }

    let passwordHash = existingShare?.passwordHash ?? null;
    if (config.requirePassword) {
      if (config.password) {
        passwordHash = await hashPassword(config.password);
      }
    } else {
      passwordHash = null;
    }

    const expiresAt = config.expiresIn
      ? new Date(Date.now() + config.expiresIn * 1000)
      : null;

    const now = new Date();
    let shareRecord: DashboardShare | undefined;

    if (existingShare) {
      const [updated] = await db
        .update(dashboardShares)
        .set({
          isPublic: config.isPublic,
          allowEmbed: config.allowEmbed ?? true,
          requirePassword: config.requirePassword,
          passwordHash,
          expiresAt,
          updatedAt: now,
        })
        .where(eq(dashboardShares.id, existingShare.id))
        .returning();

      shareRecord = updated;
    } else {
      const shareId = nanoid(16);
      const [created] = await db
        .insert(dashboardShares)
        .values({
          dashboardId,
          shareId,
          isPublic: config.isPublic,
          allowEmbed: config.allowEmbed ?? true,
          requirePassword: config.requirePassword,
          passwordHash,
          expiresAt,
          viewCount: 0,
          createdBy: user.id,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      shareRecord = created;
    }

    if (!shareRecord) {
      throw new Error('Failed to persist dashboard share');
    }

    log.info('Dashboard share saved', {
      dashboardId,
      shareId: shareRecord.shareId,
      userId: user.id,
      isPublic: shareRecord.isPublic,
    });

    return NextResponse.json({
      success: true,
      share: formatShareResponse(shareRecord, request),
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
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ownership = await assertDashboardOwnership(dashboardId, user);
    if (ownership.status !== 200) {
      return NextResponse.json(
        { error: ownership.message },
        { status: ownership.status }
      );
    }

    const share = await db.query.dashboardShares.findFirst({
      where: eq(dashboardShares.dashboardId, dashboardId),
    });

    if (!share) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ share: formatShareResponse(share, request) });
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
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ownership = await assertDashboardOwnership(dashboardId, user);
    if (ownership.status !== 200) {
      return NextResponse.json(
        { error: ownership.message },
        { status: ownership.status }
      );
    }

    const share = await db.query.dashboardShares.findFirst({
      where: eq(dashboardShares.dashboardId, dashboardId),
    });

    if (!share) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    await db.delete(dashboardShares).where(eq(dashboardShares.id, share.id));

    log.info('Dashboard share deleted', {
      dashboardId,
      shareId: share.shareId,
      userId: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Failed to delete dashboard share', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
