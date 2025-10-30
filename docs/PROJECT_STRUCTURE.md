# 项目结构

```
nextjs-universal-template/
├── .vscode/              # VSCode 配置文件（推荐扩展、设置、调试等）
├── docs/                 # 文档目录
│   ├── DEPLOYMENT.md        # 完整部署指南（Vercel/Docker）
│   ├── PROJECT_STRUCTURE.md # 项目结构说明（本文件）
│   └── CONTRIBUTING.md      # 贡献指南
├── scripts/              # 工具脚本
│   ├── fix-db.ts         # 数据库修复脚本
│   ├── fix-db.sql        # SQL 修复脚本
│   └── README.md         # 脚本说明文档
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API 路由
│   │   │   ├── hello/    # Hello API
│   │   │   └── trpc/     # tRPC 路由
│   │   ├── [status]/     # 状态码页面（400, 404, 500 等）
│   │   ├── dashboard/    # 数据看板
│   │   ├── dashboards/   # 看板管理（列表和详情）
│   │   ├── data-sources/ # 数据源管理
│   │   ├── login/        # 登录页面
│   │   ├── users/        # 用户管理（列表和详情）
│   │   ├── error.tsx     # 错误页面
│   │   ├── global-error.tsx  # 全局错误页面
│   │   ├── layout.tsx    # 根布局
│   │   ├── not-found.tsx # 404 页面
│   │   ├── page.tsx      # 首页
│   │   └── providers.tsx # 全局 Provider（tRPC, Theme）
│   ├── components/       # React 组件
│   │   ├── charts/       # 图表组件
│   │   │   ├── EChartsChart.tsx
│   │   │   ├── RechartsChart.tsx
│   │   │   └── index.ts
│   │   ├── layout/       # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── index.ts
│   │   ├── ui/           # UI 基础组件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── ApiTest.tsx   # API 测试组件
│   │   └── PlatformInfo.tsx  # 平台信息组件
│   ├── constants/        # 常量定义
│   │   └── permissions.ts
│   ├── db/               # 数据库相关
│   │   ├── index.ts      # 数据库连接
│   │   ├── schema.ts     # 数据库模式定义
│   │   └── seed.ts       # 种子数据脚本
│   ├── lib/              # 工具库
│   │   ├── env.ts        # 环境变量管理
│   │   ├── platform.ts   # 平台检测
│   │   ├── trpc/         # tRPC 客户端配置
│   │   │   ├── client.ts
│   │   │   └── Provider.tsx
│   │   └── utils.ts      # 工具函数
│   ├── server/           # 服务器端代码
│   │   ├── middleware/   # 中间件
│   │   │   ├── audit.ts  # 审计日志
│   │   │   └── permission.ts  # 权限检查
│   │   ├── routers/      # tRPC 路由
│   │   │   ├── _app.ts   # 主路由
│   │   │   ├── auth.ts   # 认证路由
│   │   │   ├── user.ts   # 用户路由
│   │   │   ├── dashboard.ts  # 看板路由
│   │   │   ├── data-source.ts  # 数据源路由
│   │   │   ├── permission.ts   # 权限路由
│   │   │   ├── auditLog.ts     # 审计日志路由
│   │   │   └── health.ts       # 健康检查路由
│   │   ├── context.ts    # tRPC 上下文
│   │   └── trpc.ts       # tRPC 初始化
│   └── types/            # TypeScript 类型定义
│       └── index.ts      # 通用类型
├── .editorconfig         # 编辑器配置
├── .gitignore            # Git 忽略规则
├── .prettierignore       # Prettier 忽略规则
├── docker-compose.yml    # Docker Compose 配置
├── Dockerfile            # Docker 配置
├── CONTRIBUTING.md       # 贡献指南
├── LICENSE               # MIT 许可证
├── README.md             # 项目说明
├── drizzle.config.ts     # Drizzle ORM 配置
├── next.config.js        # Next.js 配置
├── package.json          # 项目依赖和脚本
├── postcss.config.js     # PostCSS 配置
├── tailwind.config.ts    # Tailwind CSS 配置
├── tsconfig.json         # TypeScript 配置
└── vercel.json           # Vercel 部署配置
```

## 关键目录说明

### `src/app/`

Next.js App Router 目录，包含所有页面和 API 路由。

- **`api/`**: API 路由
  - `hello/`: Hello World API，用于测试平台信息
  - `trpc/`: tRPC 统一 API 入口
- **`[status]/`**: 动态状态码页面（400, 404, 500 等）
- **`dashboard/`**: 主数据看板页面
- **`dashboards/`**: 看板管理（CRUD）
- **`data-sources/`**: 数据源管理
- **`login/`**: 登录和注册页面
- **`users/`**: 用户管理
  - `[id]/`: 用户详情页

### `src/components/`

可复用的 React 组件。

- **`charts/`**: 图表组件（ECharts 和 Recharts）
- **`layout/`**: 布局组件（Header, Footer, MainLayout）
- **`ui/`**: 基础 UI 组件（Button, Card, Input 等）
- **`ApiTest.tsx`**: API 测试组件
- **`PlatformInfo.tsx`**: 显示平台信息

### `src/db/`

数据库相关文件。

- **`index.ts`**: 数据库连接配置
- **`schema.ts`**: Drizzle ORM 数据库模式
- **`seed.ts`**: 种子数据填充脚本

### `src/lib/`

工具库和辅助函数。

- **`env.ts`**: 环境变量管理器
- **`platform.ts`**: 平台检测工具
- **`trpc/`**: tRPC 客户端配置
- **`utils.ts`**: 通用工具函数

### `src/server/`

服务器端代码（tRPC API）。

- **`middleware/`**: 中间件
  - `audit.ts`: 审计日志中间件
  - `permission.ts`: 权限检查中间件
- **`routers/`**: tRPC 路由定义
  - `_app.ts`: 主路由，组合所有子路由
  - `auth.ts`: 认证相关（登录、注册、JWT）
  - `user.ts`: 用户管理
  - `dashboard.ts`: 看板管理
  - `data-source.ts`: 数据源管理
  - `permission.ts`: 权限管理
  - `auditLog.ts`: 审计日志
  - `health.ts`: 健康检查
- **`context.ts`**: tRPC 上下文（包含请求、数据库、用户等）
- **`trpc.ts`**: tRPC 初始化和配置

### `src/types/`

TypeScript 类型定义。

- **`index.ts`**: 通用类型定义（Platform, Runtime, PlatformInfo 等）

## 配置文件

### `next.config.js`

Next.js 配置文件，包含：
- Webpack 路径别名配置
- ESLint 和 TypeScript 配置
- 图片优化设置

### `tailwind.config.ts`

Tailwind CSS 配置，包含：
- 主题定义（颜色、字体等）
- 自定义动画
- 插件配置

### `drizzle.config.ts`

Drizzle ORM 配置，包含：
- 数据库连接信息
- Schema 文件路径
- 迁移目录

### `vercel.json`

Vercel 部署配置，包含：
- 路由规则
- 函数配置
- Edge Runtime 设置

### `tsconfig.json`

TypeScript 配置，包含：
- 编译选项
- 路径别名
- 类型检查规则

## 部署支持

项目支持以下部署方式：

### Vercel（推荐）

- ✅ 零配置部署
- ✅ 完整 Next.js 功能支持
- ✅ 自动 HTTPS 和 CDN
- ✅ 预览部署

### Docker

- ✅ 容器化部署
- ✅ 可移植性强
- ✅ 适合自有服务器
- ✅ 支持 docker-compose

详细部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 数据库

使用 PostgreSQL 数据库，通过 Drizzle ORM 进行操作。

### 数据表

所有表使用 `universal_` 前缀：

- `universal_users`: 用户表
- `universal_roles`: 角色表
- `universal_permissions`: 权限表
- `universal_dashboards`: 看板表
- `universal_widgets`: 组件表
- `universal_data_sources`: 数据源表
- `universal_audit_logs`: 审计日志表

### 常用命令

```bash
# 生成迁移
pnpm db:generate

# 推送 schema 到数据库
pnpm db:push

# 运行迁移
pnpm db:migrate

# 打开 Drizzle Studio
pnpm db:studio

# 填充种子数据
pnpm db:seed

# 修复数据库问题
pnpm db:fix
```

## API 架构

项目使用 tRPC 构建类型安全的 API。

### tRPC 路由结构

```
/api/trpc/
├── auth.register
├── auth.login
├── auth.me
├── auth.logout
├── user.list
├── user.getById
├── user.updateProfile
├── user.delete
├── dashboard.list
├── dashboard.getById
├── dashboard.create
├── dashboard.update
├── dashboard.delete
└── health.check
```

### 认证流程

1. 用户登录 → 返回 JWT token
2. Token 存储在 localStorage
3. 每次请求通过 Authorization header 发送
4. 服务器验证 JWT 并返回用户信息

## 开发工作流

1. **安装依赖**: `pnpm install`
2. **配置环境变量**: 复制 `.env.example` 到 `.env.local`
3. **初始化数据库**: `pnpm db:push && pnpm db:seed`
4. **启动开发服务器**: `pnpm dev`
5. **访问**: http://localhost:3000

## 代码规范

- **ESLint**: 代码检查和格式化
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查
- **命名规范**:
  - 组件使用 PascalCase
  - 文件名使用 kebab-case 或 PascalCase
  - 变量使用 camelCase
  - 常量使用 UPPER_SNAKE_CASE

---

**最后更新**: 2025-10-30
