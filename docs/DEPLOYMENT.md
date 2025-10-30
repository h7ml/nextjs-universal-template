# 部署详细指南

本指南详细说明如何将 Next.js Universal Template 部署到各个平台。

## 📋 目录

- [多平台同时部署](#多平台同时部署)
- [Vercel 部署](#vercel-部署)
- [Cloudflare Pages 部署](#cloudflare-pages-部署)
- [Deno Deploy 部署](#deno-deploy-部署)
- [环境变量配置](#环境变量配置)
- [故障排除](#故障排除)

---

## 多平台同时部署

借助仓库内置的 `scripts/deploy.sh` 脚本，可以一次性构建并部署到 Vercel、Deno Deploy 和 Cloudflare Pages。

> 💡 **已经把仓库连接到平台了吗？**
>
> 当你在 Vercel、Cloudflare Pages 或 Deno Deploy 中绑定 Git 仓库后，每次推送都会由平台自动构建并部署。此时无需运行 `deploy.sh`，只需在对应平台的 "Build command" / "Entry point" 中使用下文的推荐配置即可。`deploy.sh` 更适合需要在本地或 CI 中串联三方 CLI 的场景。

### 一键部署命令

```bash
# 构建并依次部署到三个平台
pnpm deploy:all
```

脚本会自动：

- 检测并复用已有的 `.next` 构建结果（如不存在则执行 `pnpm build`）
- 使用 `deployctl` 推送到 Deno Deploy，并尝试预热 Deno 缓存
- 仅在缺少 `.vercel/output/static` 时运行 `pnpm pages:build`，避免重复构建
- 调用 Vercel CLI 完成生产部署，在检测到凭据时启用非交互模式

### 必需的 CLI 工具

| 平台 | CLI | 安装命令 |
| ---- | --- | -------- |
| Vercel | `vercel` | `npm i -g vercel` |
| Deno Deploy | `deployctl` | `deno install -A jsr:@deno/deploy-cli` |
| Cloudflare Pages | `wrangler` | `npm i -g wrangler` |

脚本会检测这些工具是否安装；缺失时会给出安装提示。

> ℹ️ **Vercel CLI 提示**：当设置 `VERCEL_TOKEN`、`VERCEL_ORG_ID`、`VERCEL_PROJECT_ID` 时，脚本会在后台导出这些变量并以非交互方式执行 `vercel deploy --prod`。无需额外的 `--scope` 或 `--project` 参数，可避免新版 CLI 报错。

### 环境变量（推荐）

在 CI/CD 环境中，提前配置以下变量即可实现全自动部署：

```env
# Vercel
VERCEL_TOKEN=xxxx
VERCEL_ORG_ID=team_xxxx
VERCEL_PROJECT_ID=prj_xxxx

# Deno Deploy
DENO_DEPLOY_TOKEN=xxxx
DENO_PROJECT=your-deno-project

# Cloudflare Pages
CLOUDFLARE_API_TOKEN=xxxx
CLOUDFLARE_ACCOUNT_ID=xxxx
CLOUDFLARE_PROJECT_NAME=nextjs-universal-template
```

> 💡 **提示**：变量缺失时，CLI 会切换到交互模式，你可以在本地手动确认部署流程。

---

## Vercel 部署

### 前置条件

- GitHub 账号
- Vercel 账号（可通过 GitHub 登录）

### 步骤

#### 1. 通过 GitHub 集成部署（推荐）

1. **推送代码到 GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin git@github.com:h7ml/nextjs-universal-template.git
   git push -u origin main
   ```

2. **连接 Vercel**
   - 访问 [https://vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 导入 GitHub 仓库
   - Vercel 会自动检测 Next.js 配置

3. **配置项目**
   - Framework Preset: Next.js（自动检测）
   - Root Directory: `./`（默认）
   - Build Command: `npm run build`（自动）
   - Output Directory: `.next`（自动）
   - Install Command: `npm install`（自动）

4. **环境变量**
   - 在项目设置中添加环境变量
   - `VERCEL=1` 会自动设置，无需手动添加

5. **部署与自动化**
   - 首次点击 "Deploy" 后，Vercel 会自动构建 `main`（或你设置的分支）
   - 之后每次推送都会触发新构建，无需手动运行脚本

#### 2. 通过 CLI 部署

1. **安装 Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **登录**

   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel              # 预览部署
   vercel --prod     # 生产部署
   ```

#### 配置说明

- **vercel.json**: 已配置 Edge Runtime 和路由规则
- **自动 HTTPS**: Vercel 自动配置 SSL 证书
- **CDN**: 自动启用全球 CDN
- **预览部署**: 每个 PR 自动创建预览链接

---

## Cloudflare Pages 部署

### 前置条件

- GitHub 账号
- Cloudflare 账号

### 步骤

#### 1. 通过 GitHub 集成部署（推荐）

1. **推送代码到 GitHub**（同上）

2. **连接 Cloudflare Pages**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 进入 "Pages" → "Create a project"
   - 选择 "Connect to Git"
   - 连接 GitHub 账号并选择仓库

3. **配置构建设置**
   - **Project name**: `nextjs-universal-template`（或自定义）
   - **Production branch**: `main` 或 `master`
   - **Build command**: `pnpm pages:build`（⚠️ 不要使用默认的 `npm run build`，否则不会生成 `.vercel/output/static`）
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: `/`（留空）
   - **Framework preset**: Next.js

4. **环境变量**
   - 在项目设置 → Environment variables 中添加：
     - `CF_PAGES=1`（用于平台检测）
     - `NODE_ENV=production`
     - `NODE_VERSION=18`（或 Cloudflare 支持的更高版本，确保兼容 `pnpm pages:build`）
   - 使用 pnpm 时，在 "Environment variables" 中添加 `PNPM_HOME=/opt/buildhome/.pnpm` 并在 "Build settings" 启用 `Enable pnpm` 选项；命令内部会通过 `pnpm dlx @cloudflare/next-on-pages@1.13.16` 自动拉取适配器，无需把它加入项目依赖

5. **部署与自动化**
   - 点击 "Save and Deploy"，Cloudflare Pages 会先执行一次构建
   - 之后每次推送都会自动重新执行 `pnpm pages:build` 并部署 `.vercel/output/static`

#### 2. 通过 Wrangler CLI 部署

1. **安装 Wrangler**

   ```bash
   npm i -g wrangler
   ```

2. **登录**

   ```bash
   wrangler login
   ```

3. **构建 Cloudflare 产物**

   ```bash
   pnpm pages:build  # 自动通过 pnpm dlx 下载 @cloudflare/next-on-pages
   ```

4. **部署**

   ```bash
   wrangler pages publish .vercel/output/static --project-name=nextjs-universal-template
   ```

#### 注意事项

⚠️ **关于 @cloudflare/next-on-pages**：

- 仓库不再把 `@cloudflare/next-on-pages` 作为 devDependency，以避免 Vercel 等平台在安装依赖时出现 peer 版本冲突。
- `pnpm pages:build` 会在执行时通过 `pnpm dlx @cloudflare/next-on-pages@1.13.16` 下载适配器，依旧能够稳定生成 `.vercel/output/static`，并与 `deploy.sh` 的 Cloudflare 分支保持一致。
- 如果你计划长期维护 Cloudflare Pages 生产环境，建议关注 [OpenNext](https://opennext.js.org/cloudflare) 或官方后续替代方案。

✅ **提示**：

- `pnpm pages:build` 会自动跳过 `.next/cache`，避免超出 25 MiB 限制。
- 若希望继续沿用旧的 `pnpm build:cf` + `.next` 流程，可在 Dashboard 中改回这些命令，但功能会受到限制（例如动态路由和 tRPC）。

---

## Deno Deploy 部署

### 前置条件

- GitHub 账号
- Deno Deploy 账号

### 步骤

#### 1. 创建 Deno 服务器入口

Deno Deploy 需要自定义服务器入口。创建一个 `deno_server.ts` 文件：

```typescript
// deno_server.ts
/// <reference types="https://deno.land/x/types/react/index.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// 注意：这是一个简化示例，实际需要更复杂的 Next.js 适配
serve(
  async (req: Request) => {
    const url = new URL(req.url);

    // 处理 API 路由
    if (url.pathname.startsWith("/api/")) {
      // 转发到 Next.js API Routes
      // 实际实现需要更复杂的适配逻辑
    }

    // 返回静态文件或 HTML
    return new Response("Deno Deploy + Next.js", {
      headers: { "content-type": "text/html" },
    });
  },
  { port: 8080 }
);
```

#### 2. 通过 GitHub 部署

1. **推送代码到 GitHub**（同上）

2. **连接 Deno Deploy**
   - 访问 [Deno Deploy](https://deno.com/deploy)
   - 点击 "New Project"
   - 连接 GitHub 仓库

3. **配置项目**
   - **Entry point**: `deno_server.ts`（或你创建的入口文件）
   - **Environment variables**: 添加 `DENO=1`

4. **部署**
   - 点击 "Deploy"
   - 等待部署完成

#### 注意事项

⚠️ **重要限制**：

- Deno Deploy 使用 Deno 运行时，不是 Node.js
- 不能直接运行 Next.js（需要转换或适配）
- 需要使用 Web Standard API（Fetch、Request、Response）
- 某些 Node.js 特定 API 不可用

✅ **建议方案**：

1. **使用 Deno 适配的 Next.js**（如 Fresh framework）
2. **仅部署 API Routes** 到 Deno Deploy，前端部署到其他平台
3. **使用静态导出** + Deno 处理 API

---

## 环境变量配置

### Vercel

在项目设置 → Environment Variables 中添加：

```
VERCEL=1                    # 自动设置
CUSTOM_KEY=your-value       # 自定义变量
NEXT_PUBLIC_API_URL=https://api.example.com  # 客户端变量
```

### Cloudflare Pages

在项目设置 → Environment variables 中添加：

```
CF_PAGES=1                  # 平台标识
NODE_ENV=production         # 环境类型
CUSTOM_KEY=your-value       # 自定义变量
```

### Deno Deploy

在项目设置 → Environment Variables 中添加：

```
DENO=1                      # 平台标识
CUSTOM_KEY=your-value       # 自定义变量
```

---

## 故障排除

### Vercel 部署问题

**问题**: 构建失败

- 检查 `next.config.js` 配置
- 确保所有依赖在 `package.json` 中
- 检查 Node.js 版本兼容性（推荐 18+）

**问题**: API Routes 不工作

- 确保使用 Edge Runtime：`export const runtime = 'edge'`
- 检查 `vercel.json` 中的函数配置

### Cloudflare Pages 部署问题

**问题**: 静态导出失败

- 确保 `next.config.js` 中设置了 `output: 'export'`（当 `CF_PAGES=1` 时）
- 检查是否有服务端渲染（SSR）代码

**问题**: API Routes 404

- Cloudflare Pages 不支持 Next.js API Routes
- 需要转换为 Cloudflare Workers Functions

**问题**: 图片不显示

- 图片优化已禁用，使用外部图片 URL
- 或使用 Cloudflare Images 服务

### Deno Deploy 部署问题

**问题**: 模块导入错误

- 使用 ESM 导入：`import` 而不是 `require`
- 使用 CDN URL 导入 npm 包（如 esm.sh）

**问题**: API 不兼容

- 使用 Web Standard API
- 避免使用 Node.js 特定 API（如 `fs`、`path`）

---

## 🎯 最佳实践

1. **统一使用 Edge Runtime**
   - 所有 API Routes 使用 `export const runtime = 'edge'`
   - 确保跨平台兼容性

2. **环境变量安全**
   - 使用 `NEXT_PUBLIC_*` 前缀暴露客户端变量
   - 敏感信息只在服务端使用

3. **平台检测**
   - 使用 `src/lib/platform.ts` 统一检测
   - 避免硬编码平台特定逻辑

4. **构建优化**
   - 使用平台特定的构建配置
   - 确保输出格式正确

5. **测试**
   - 在本地测试所有平台构建
   - 使用预览环境验证部署

---

## 📞 获取帮助

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Cloudflare**: [community.cloudflare.com](https://community.cloudflare.com)
- **Deno**: [discord.gg/deno](https://discord.gg/deno)

---

**最后更新**: 2025-01-30
