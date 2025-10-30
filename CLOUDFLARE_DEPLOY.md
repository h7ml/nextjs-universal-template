# Cloudflare Pages 部署指南

## 方案对比

本项目提供两种 Cloudflare Pages 部署方式：

### 方案 1: 使用 @cloudflare/next-on-pages（功能完整但已废弃）

虽然官方已废弃并推荐 OpenNext，但仍可使用：

```bash
# 1. 构建
pnpm pages:build

# 2. 部署
pnpm pages:deploy

# 或本地预览
pnpm pages:dev
```

**特点**：
- ✅ 支持数据库和 tRPC
- ✅ 支持动态路由
- ✅ 自动转换为 Cloudflare Workers
- ⚠️ 包已废弃，未来可能不支持

### 方案 2: 使用 wrangler 直接部署（简单但受限）

```bash
# 1. 清理缓存构建
pnpm cf:build

# 2. 部署
pnpm cf:deploy

# 或本地预览
pnpm cf:preview
```

**特点**：
- ✅ 简单直接
- ✅ 不依赖废弃包
- ⚠️ 功能可能受限（动态路由、数据库）

## 推荐使用方式

### 在 Cloudflare Pages Dashboard

| 配置项 | 方案 1（推荐） | 方案 2 |
|--------|--------------|--------|
| **Build command** | `pnpm pages:build` | `pnpm build:cf` |
| **Build output directory** | `.vercel/output/static` | `.next` |
| **Environment variables** | DATABASE_URL, JWT_SECRET | DATABASE_URL, JWT_SECRET |

### 环境变量配置

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-jwt-secret-min-32-chars
NODE_ENV=production
```

## 注意事项

1. **@cloudflare/next-on-pages 已废弃**
   - 虽然仍可使用，但未来可能停止维护
   - 新项目建议使用 Vercel 或 OpenNext

2. **动态路由已配置 Edge Runtime**
   - 所有动态路由（[status]、users/[id]、dashboards/[id]）已添加 `export const runtime = 'edge'`
   - 满足 Cloudflare Pages 要求

3. **数据库连接**
   - 确保数据库支持 HTTP 连接（如 Neon Serverless）
   - 在 Cloudflare Pages 环境变量中配置 DATABASE_URL

## 最佳实践

对于本项目（包含数据库、tRPC、动态路由），建议：

1. **生产环境**: 使用 **Vercel**（零配置，完整功能）
2. **边缘 API**: 使用 **Deno Deploy**（纯 API 服务）
3. **测试/预览**: 可以尝试 **Cloudflare Pages**

## 故障排除

### 问题：构建时超过文件大小限制

**解决**：使用 `pnpm build:cf` 或 `pnpm cf:build`，会自动清理缓存。

### 问题：动态路由报错

**解决**：确保所有动态路由页面都添加了 `export const runtime = 'edge'`。

### 问题：数据库连接失败

**解决**：确保在 Cloudflare Pages 环境变量中配置了正确的 DATABASE_URL。

---

**最后更新**: 2025-01-30

