# Deno 完整指南

> 本项目支持部署到 Deno Deploy 平台。本文档包含开发、部署和 API 使用的完整说明。

## 📋 目录

- [快速开始](#快速开始)
- [开发模式](#开发模式)
- [API 接口支持](#api-接口支持)
- [部署详细步骤](#部署详细步骤)
- [环境变量配置](#环境变量配置)
- [故障排除](#故障排除)
- [最佳实践](#最佳实践)

---

## 🚀 快速开始

### 可以部署！

你的项目已经准备好部署到 Deno Deploy 了。按照以下步骤操作：

### 方法 1: 通过 GitHub（推荐）⭐

#### 1️⃣ 准备 GitHub 仓库

```bash
# 确保代码已提交
git add .
git commit -m "Ready for Deno Deploy"
git push origin main
```

#### 2️⃣ 访问 Deno Deploy Dashboard

1. 打开 [https://dash.deno.com](https://dash.deno.com)
2. 使用 GitHub 账号登录

#### 3️⃣ 创建新项目

1. 点击 **"New Project"**
2. 选择 **"Deploy from GitHub"**
3. 授权 Deno Deploy 访问你的 GitHub 账号
4. 选择你的仓库

#### 4️⃣ 配置项目

**必填项：**

- **Name**: `nextjs-universal-template`（或自定义）
- **Entry Point**: `deno_server.ts` ⚠️ 重要！

**环境变量（Environment Variables）：**

点击 "Environment Variables" 添加：

```
DENO=1
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-very-secret-key-min-32-characters-long
```

⚠️ **重要**:

- `DATABASE_URL` 是必需的（可以使用 Neon Serverless）
- `JWT_SECRET` 建议使用 32+ 字符的随机字符串

#### 5️⃣ 部署

1. 点击 **"Deploy"** 按钮
2. 等待部署完成（通常 1-2 分钟）
3. 获得部署 URL：`https://your-project.deno.dev`

### 方法 2: 使用 Deno CLI

如果你有 Deno CLI 和 Deno Deploy 账号：

```bash
# 安装 Deno Deploy CLI
deno install -A jsr:@deno/deploy-cli

# 部署
deployctl deploy --project=your-project-name deno_server.ts
```

> 💡 也可以运行 `pnpm deploy:all`，脚本会自动调用 `deployctl` 并串联其它平台的部署流程。

---

## 🛠️ 开发模式

### ✅ 集成模式（推荐）

Deno 服务器已经配置为**自动集成** Next.js 应用：

#### 开发时：自动代理到 Next.js

1. **启动 Next.js**: `npm run dev` (终端 1)
2. **启动 Deno**: `deno task dev` (终端 2)
3. **访问**: `http://localhost:8080` - Deno 会自动代理到 Next.js！

**工作原理**:

- Deno 会检测 Next.js 是否在 `localhost:3000` 运行
- 如果是，前端页面请求会自动代理到 Next.js
- API 路由（`/api/*`）由 Deno 直接处理
- **结果**: 通过 Deno 也能看到完整的 Next.js 应用！

#### 生产时：提供静态文件

- 如果已经构建（`npm run build`），Deno 会尝试提供构建后的静态文件
- 适合部署到 Deno Deploy

### 📋 使用方式对比

| 方式                            | 用途              | 结果                               |
| ------------------------------- | ----------------- | ---------------------------------- |
| `npm run dev`                   | 标准 Next.js 开发 | ✅ 完整应用                        |
| `deno task dev` + `npm run dev` | Deno 集成模式     | ✅ 完整应用（通过 Deno）           |
| `deno task dev`                 | 仅 Deno API       | ⚠️ 仅 API（除非 Next.js 也在运行） |

### 🚀 推荐开发流程

#### 方式 1：集成开发（推荐）✨

```bash
# 终端 1: 启动 Next.js
npm run dev

# 终端 2: 启动 Deno（会自动检测并代理到 Next.js）
deno task dev

# 访问 http://localhost:8080 - 看到完整的 Next.js 应用！
```

#### 方式 2：标准 Next.js 开发

```bash
# 仅启动 Next.js 开发服务器
npm run dev

# 访问 http://localhost:3000
```

#### 方式 3：仅测试 Deno API

```bash
# 仅启动 Deno（不会代理到 Next.js）
deno task dev

# 访问 http://localhost:8080
# 会显示 API 服务器信息页面
```

### 📊 功能对比

| 特性           | `npm run dev` | `deno + npm run dev`（集成模式） | `deno`（单独）     |
| -------------- | ------------- | -------------------------------- | ------------------ |
| **前端页面**   | ✅ 完整支持   | ✅ 完整支持（代理）              | ⚠️ 需 Next.js 运行 |
| **API 路由**   | ✅ Node.js    | ✅ Deno 处理                     | ✅ Deno 处理       |
| **服务端渲染** | ✅ 支持       | ✅ 支持（通过代理）              | ❌ 不支持          |
| **开发体验**   | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐                         | ⭐⭐               |
| **适用场景**   | 标准开发      | 集成测试                         | API 测试           |

---

## 📡 API 接口支持

### ✅ 完全支持的接口

这些接口在 Deno Deploy 中**完全可用**：

#### 1. 健康检查

```bash
GET /api/health
```

**响应**:

```json
{
  "status": "ok",
  "platform": "deno",
  "timestamp": "2025-01-30T..."
}
```

#### 2. 平台信息

```bash
GET /api/hello
```

**响应**:

```json
{
  "message": "Hello from Next.js Universal Template!",
  "platform": "Deno Deploy",
  "platformInfo": {
    "platform": "deno",
    "runtime": "edge",
    "environment": "production"
  }
}
```

#### 3. 环境变量（安全）

```bash
GET /api/env
```

**响应**: 仅返回安全的环境变量

#### 4. tRPC 健康检查

```bash
GET /api/trpc/health.check
```

**响应**: 同 `/api/health`

### ⚠️ 部分支持的接口

这些接口在 Deno 中有**基础支持**，完整功能需要 Next.js：

#### tRPC 接口

```bash
GET /api/trpc/router.procedure
POST /api/trpc/router.procedure
```

**支持情况**:

- ✅ `/api/trpc/health.check` - 完全支持
- ⚠️ 其他 tRPC 端点 - 开发时自动代理到 Next.js，生产时返回提示

**开发模式**:

- 如果 Next.js dev 服务器在运行，所有 tRPC 请求自动代理
- 提供完整的 tRPC 功能

**生产模式**:

- 返回友好的错误提示
- 建议使用 Next.js 环境或实现 REST API 替代

### ❌ 需要 Next.js 的接口

这些接口需要完整的 Next.js 环境：

- `/api/users` - 完整功能需要 Next.js
- `/api/trpc/auth.*` - 需要数据库和完整 tRPC
- `/api/trpc/user.*` - 需要数据库和完整 tRPC
- `/api/trpc/dashboard.*` - 需要数据库和完整 tRPC

### 🔄 开发 vs 生产

#### 开发模式（推荐）

**同时运行**:

```bash
# 终端 1: Next.js（完整 API 支持）
npm run dev

# 终端 2: Deno（代理到 Next.js）
deno task dev
```

**结果**:

- ✅ 所有 API 接口完全可用
- ✅ Deno 自动代理到 Next.js
- ✅ 可以测试 Deno 配置

#### 生产模式

**Deno Deploy**:

- ✅ 基础 API 接口可用
- ⚠️ tRPC 有限支持
- ❌ 复杂功能需要 Next.js

**推荐**: 使用 Vercel 或混合部署

---

## 📦 部署详细步骤

### 前置条件

- GitHub 账号
- Deno Deploy 账号（可通过 GitHub 登录）
- PostgreSQL 数据库（推荐 Neon Serverless，完全兼容）

### Deno 适配说明

#### 关键差异

| 特性     | Node.js         | Deno                 |
| -------- | --------------- | -------------------- |
| 模块系统 | CommonJS + ESM  | 纯 ESM               |
| 包管理   | npm/yarn/pnpm   | URL imports (esm.sh) |
| API      | Node.js APIs    | Web Standard APIs    |
| 运行时   | Node.js runtime | Deno runtime         |
| 文件系统 | ✅ 支持         | ❌ 不支持（只读）    |

#### 适配文件

1. **`deno_server.ts`**: Deno Deploy 入口文件
2. **`deno.json`**: Deno 配置（imports map、任务）
3. **`src/db/deno.ts`**: Deno 版本的数据库连接

### 部署步骤

#### 方式 1: 通过 Deno Deploy Dashboard（推荐）

##### 1. 准备代码

确保项目包含以下文件：

- ✅ `deno_server.ts` - Deno 服务器入口
- ✅ `deno.json` - Deno 配置
- ✅ `.gitignore` - 确保排除 `node_modules`

##### 2. 推送到 GitHub

```bash
git add .
git commit -m "Add Deno Deploy support"
git push origin main
```

##### 3. 连接 Deno Deploy

1. 访问 [Deno Deploy Dashboard](https://dash.deno.com)
2. 登录（使用 GitHub 账号）
3. 点击 **"New Project"**
4. 选择 **"Deploy from GitHub"**
5. 选择仓库并授权

##### 4. 配置项目

在项目配置页面设置：

- **Name**: `nextjs-universal-template`（或自定义）
- **Entry Point**: `deno_server.ts`
- **Environment Variables**:
  ```
  DENO=1
  DATABASE_URL=postgresql://user:password@host:5432/database
  JWT_SECRET=your-jwt-secret-min-32-chars
  NODE_ENV=production
  ```

##### 5. 部署

点击 **"Deploy"** 按钮，等待部署完成。

##### 6. 访问

部署完成后，Deno Deploy 会提供 URL：

- 生产: `https://your-project.deno.dev`
- 预览: `https://your-project-preview.deno.dev`

#### 方式 2: 使用 Deno CLI（本地测试）

##### 1. 安装 Deno

```bash
# macOS / Linux
curl -fsSL https://deno.land/install.sh | sh

# Windows (PowerShell)
irm https://deno.land/install.ps1 | iex
```

##### 2. 验证安装

```bash
deno --version
```

##### 3. 设置环境变量

创建 `.env.local` 文件（Deno 会自动读取）：

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-jwt-secret
DENO=1
```

##### 4. 运行开发服务器

```bash
# 使用 Deno task
deno task dev

# 或直接运行
deno run --allow-all --allow-env --allow-net deno_server.ts
```

##### 5. 访问

打开浏览器访问 `http://localhost:8080`

---

## 🔐 环境变量配置

### 必需变量

| 变量名         | 说明                  | 示例                             |
| -------------- | --------------------- | -------------------------------- |
| `DENO`         | 平台标识              | `1`                              |
| `NODE_ENV`     | 环境类型              | `production`                     |
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@host/db` |
| `JWT_SECRET`   | JWT 密钥              | 随机 32+ 字符                    |

### 可选变量

| 变量名 | 说明       | 默认值                         |
| ------ | ---------- | ------------------------------ |
| `PORT` | 服务器端口 | `8080`（Deno Deploy 自动处理） |

### 在 Deno Deploy Dashboard 中设置

1. 进入项目设置
2. 点击 **"Settings"** → **"Environment Variables"**
3. 添加变量并点击 **"Save"**
4. 重新部署以应用更改

---

## 🐛 故障排除

### 问题 1: 模块导入错误

**错误**: `Error: Uncaught (in promise) TypeError: Cannot resolve module...`

**原因**: Deno 不能直接导入 npm 包，需要使用 ESM URL。

**解决**:

1. 检查 `deno.json` 中的 imports map
2. 使用 `esm.sh` 或 `deno.land/x` 作为包源
3. 确保所有导入使用 `.ts` 扩展名（或 Deno 支持的扩展名）

### 问题 2: 数据库连接失败

**错误**: `Error: Failed to connect to database`

**原因**: Deno 的 PostgreSQL 客户端配置不同。

**解决**:

1. 确保使用 `src/db/deno.ts` 而非 `src/db/index.ts`
2. 检查 `DATABASE_URL` 格式正确
3. 如果是 Neon Serverless，确保使用 HTTP 连接字符串

### 问题 3: tRPC 不工作

**错误**: `tRPC endpoint returns 501`

**原因**: tRPC 在 Deno 中需要额外配置。

**解决**:

1. 开发时：运行 `npm run dev`，Deno 会自动代理到 Next.js
2. 生产时：
   - 方案 A: 部署到 Vercel（完整 tRPC 支持）
   - 方案 B: 实现 REST API 端点作为替代
   - 方案 C: 混合部署（前端 Vercel，API Deno）

### 问题 4: 端口冲突

**错误**: `Error: Address already in use`

**解决**:

```bash
# 设置不同的端口
export PORT=3001
deno run --allow-all deno_server.ts
```

### 问题 5: 权限错误

**错误**: `Permission denied`

**解决**:

```bash
# 授予所有权限（开发环境）
deno run --allow-all deno_server.ts

# 或授予特定权限（生产环境推荐）
deno run \
  --allow-env \
  --allow-net \
  --allow-read \
  deno_server.ts
```

### 问题 6: 部署失败

**检查：**

- ✅ Entry Point 是否为 `deno_server.ts`
- ✅ 环境变量是否都设置了
- ✅ `DATABASE_URL` 格式是否正确

### 问题 7: 静态文件不显示

**原因**: Deno Deploy 需要预先构建的静态文件

**解决**:

```bash
# 在 Deno Deploy 中添加构建步骤（如果需要）
# 或者在 GitHub Actions 中构建后部署
```

### 问题 8: API 返回 404 或 501

**常见情况**:

- ✅ `/api/health`, `/api/hello`, `/api/env` - 应该正常工作
- ⚠️ `/api/trpc/*` - 如果不是 health.check，会返回 501（需要 Next.js）
- ⚠️ `/api/users` - 返回提示信息（需要 Next.js）

**解决**:

- 开发时：确保 Next.js dev 服务器运行（`npm run dev`），Deno 会自动代理
- 生产时：完整的 tRPC API 需要部署到 Vercel，或使用 REST API 替代方案

---

## ⚠️ Deno Deploy 的限制

### 技术限制

1. **文件系统只读**: 不能写入文件到磁盘
2. **Next.js SSR**: 不支持完整的服务端渲染（需要使用静态导出）
3. **tRPC API**: 完整的 tRPC 支持需要 Next.js 环境，Deno 提供基础支持：
   - ✅ 开发模式：自动代理到 Next.js（如果运行）
   - ✅ 生产模式：提供基础 REST API 和健康检查
   - ⚠️ 完整功能：推荐部署到 Vercel 或使用混合部署

### API 支持情况

| API 类型                 | Deno 支持 | 说明                                 |
| ------------------------ | --------- | ------------------------------------ |
| `/api/health`            | ✅ 完整   | 健康检查                             |
| `/api/hello`             | ✅ 完整   | 平台信息                             |
| `/api/env`               | ✅ 完整   | 环境变量                             |
| `/api/trpc/health.check` | ✅ 基础   | tRPC 健康检查                        |
| `/api/trpc/*`            | ⚠️ 部分   | 开发时代理到 Next.js，生产时基础支持 |
| `/api/users`             | ⚠️ 部分   | 需要 Next.js 环境获取完整功能        |

---

## 💡 推荐工作流和解决方案

### 方案 1: 混合部署（推荐）✨

- **前端** → 部署到 **Vercel** 或 **Cloudflare Pages**
- **API** → 部署到 **Deno Deploy**
- **优势**: 充分利用各平台优势

### 方案 2: 完整 Next.js 部署

- **全部** → 部署到 **Vercel**（最佳体验）
- **优势**: 完整支持所有功能

### 方案 3: 静态 + Deno API

- 使用 `CF_PAGES=1 npm run build` 生成静态文件
- 静态文件 → Cloudflare Pages
- API 路由 → Deno Deploy

### 方案 4: 使用 Next.js（最简单）

部署到 **Vercel**，获得完整的 API 支持：

- ✅ 所有 tRPC 接口
- ✅ 数据库连接
- ✅ 完整认证系统

---

## 🎯 最佳实践

### 开发时

1. **使用 Next.js dev 服务器 + Deno 代理**（测试配置）
2. 利用 Deno 的自动代理功能测试集成

### 生产时

1. **完整应用** → Vercel
2. **API 服务** → Deno Deploy（仅基础接口）
3. **混合部署** → 前端 Vercel，API Deno

### 环境变量

1. **不要在代码中硬编码敏感信息**
2. 使用环境变量管理所有配置

### 错误处理

1. **使用 try-catch 包装所有异步操作**
2. 提供友好的错误提示

### 日志

1. **使用 `console.log` 进行调试**（Deno Deploy 会自动捕获）
2. 在 Deno Deploy Dashboard 查看实时日志

### 性能优化

1. **使用 HTTP/2** - Deno Deploy 默认支持
2. **边缘计算** - Deno Deploy 自动在全球边缘节点部署
3. **连接池** - 对于数据库连接，建议使用连接池

---

## 📝 总结

### Deno Deploy 适合：

- ✅ 简单的 API 服务
- ✅ 健康检查
- ✅ 平台信息查询
- ✅ Edge 计算任务

### 不适合：

- ❌ 复杂的 tRPC 路由
- ❌ 需要完整数据库操作的应用
- ❌ Next.js 特定的功能

### 建议

对于完整的 Next.js 应用，使用 Vercel 部署；Deno Deploy 适合简单的边缘 API。

---

## 📚 相关资源

- [Deno Deploy 官方文档](https://deno.com/deploy/docs)
- [Deno 手册](https://deno.land/manual)
- [esm.sh CDN](https://esm.sh) - npm 包的 ESM CDN
- [Fresh Framework](https://fresh.deno.dev/) - Deno 原生 Web 框架

---

**最后更新**: 2025-01-30
