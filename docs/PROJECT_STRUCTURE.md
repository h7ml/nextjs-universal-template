# 项目结构

```
nextjs-universal-template/
├── .vscode/              # VSCode 配置文件（推荐扩展、设置、调试等）
├── docs/                 # 文档目录
│   ├── DENO.md              # Deno 完整指南（开发、部署、API）
│   ├── DEPLOYMENT.md        # 完整部署指南（Vercel/Cloudflare/Docker）
│   ├── PROJECT_STRUCTURE.md # 项目结构说明（本文件）
│   └── CONTRIBUTING.md      # 贡献指南
├── scripts/              # 工具脚本
│   ├── deploy.sh         # 部署脚本（多平台）
│   ├── fix-db.ts         # 数据库修复脚本
│   ├── fix-db.sql        # SQL 修复脚本
│   └── test-deno.sh      # Deno 测试脚本
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API 路由
│   │   │   ├── env/      # 环境变量 API
│   │   │   ├── hello/    # Hello API
│   │   │   ├── trpc/     # tRPC 路由
│   │   │   └── users/    # 用户 API（REST，已废弃，使用 tRPC）
│   │   ├── [status]/     # 状态码页面（400, 404, 500 等）
│   │   ├── dashboard/    # 数据看板
│   │   ├── dashboards/     # 看板管理（列表和详情）
│   │   ├── login/       # 登录页面
│   │   ├── users/       # 用户管理（列表和详情）
│   │   ├── error.tsx    # 错误页面
│   │   ├── global-error.tsx  # 全局错误页面
│   │   ├── layout.tsx   # 根布局
│   │   ├── not-found.tsx     # 404 页面
│   │   ├── page.tsx     # 首页
│   │   └── providers.tsx     # 全局 Provider（tRPC, Theme）
│   ├── components/      # React 组件
│   │   ├── charts/      # 图表组件
│   │   │   ├── EChartsChart.tsx
│   │   │   ├── RechartsChart.tsx
│   │   │   └── index.ts
│   │   ├── layout/      # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── index.ts
│   │   ├── ui/          # UI 基础组件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── ApiTest.tsx  # API 测试组件
│   │   └── PlatformInfo.tsx  # 平台信息组件
│   ├── db/              # 数据库相关
│   │   ├── deno.ts      # Deno 环境数据库连接
│   │   ├── index.ts     # Node.js 环境数据库连接
│   │   ├── schema.ts    # 数据库模式定义
│   │   └── seed.ts      # 种子数据脚本
│   ├── lib/             # 工具库
│   │   ├── env.ts       # 环境变量管理
│   │   ├── platform.ts  # 平台检测
│   │   ├── trpc/        # tRPC 客户端配置
│   │   │   ├── client.ts
│   │   │   └── Provider.tsx
│   │   └── utils.ts     # 工具函数
│   ├── server/          # 服务器端代码
│   │   ├── deno/        # Deno 特定代码
│   │   │   └── create-trpc-handler.ts
│   │   ├── routers/     # tRPC 路由
│   │   │   ├── _app.ts  # 主路由
│   │   │   ├── auth.ts  # 认证路由
│   │   │   ├── user.ts  # 用户路由
│   │   │   ├── dashboard.ts  # 看板路由
│   │   │   └── health.ts     # 健康检查路由
│   │   ├── context.ts   # tRPC 上下文（Node.js）
│   │   ├── context.deno.ts   # tRPC 上下文（Deno）
│   │   └── trpc.ts      # tRPC 初始化
│   └── types/           # TypeScript 类型定义
│       ├── deno.d.ts    # Deno 类型声明
│       └── index.ts     # 通用类型
├── .editorconfig        # 编辑器配置
├── .gitignore           # Git 忽略规则
├── .nvmrc               # Node.js 版本
├── CONTRIBUTING.md      # 贡献指南
├── LICENSE              # MIT 许可证
├── README.md            # 项目说明
├── deno.json            # Deno 配置
├── deno_server.ts       # Deno 部署入口
├── drizzle.config.ts    # Drizzle ORM 配置
├── next.config.js       # Next.js 配置
├── package.json         # 项目依赖和脚本
├── postcss.config.js    # PostCSS 配置
├── tailwind.config.ts   # Tailwind CSS 配置
├── tsconfig.json        # TypeScript 配置
├── vercel.json          # Vercel 部署配置
└── wrangler.toml        # Cloudflare Pages 配置
```

## 关键目录说明

### `src/app/`

Next.js App Router 目录，包含所有页面和 API 路由。

### `src/components/`

可复用的 React 组件，按功能分类：

- `ui/`: 基础 UI 组件（按钮、卡片、输入框等）
- `layout/`: 布局组件（Header、Footer、MainLayout）
- `charts/`: 图表组件（ECharts、Recharts）

### `src/server/`

服务器端代码，主要是 tRPC 路由和上下文：

- `routers/`: tRPC 路由定义
- `deno/`: Deno 特定实现
- `context.ts`: Node.js 上下文
- `context.deno.ts`: Deno 上下文

### `src/db/`

数据库相关代码：

- `schema.ts`: 数据库模式（使用 Drizzle ORM）
- `index.ts`: Node.js 数据库连接
- `deno.ts`: Deno 数据库连接
- `seed.ts`: 种子数据脚本

### `src/lib/`

工具函数和配置：

- `trpc/`: tRPC 客户端配置
- `env.ts`: 环境变量管理
- `platform.ts`: 平台检测
- `utils.ts`: 通用工具函数

### `scripts/`

工具脚本：

- `deploy.sh`: 多平台部署脚本
- `fix-db.ts`: 数据库修复脚本
- `test-deno.sh`: Deno 测试脚本

### `docs/`

项目文档，包含部署指南、开发指南等。

## 配置文件说明

- `next.config.js`: Next.js 配置，包含多平台适配
- `deno.json`: Deno 运行时配置
- `drizzle.config.ts`: Drizzle ORM 配置
- `tailwind.config.ts`: Tailwind CSS 配置
- `tsconfig.json`: TypeScript 配置
- `.editorconfig`: 代码风格配置

## 路由结构

### 页面路由

- `/`: 首页
- `/login`: 登录页面
- `/dashboard`: 数据看板
- `/dashboards`: 看板列表
- `/dashboards/[id]`: 看板详情
- `/users`: 用户列表（需要管理员权限）
- `/users/[id]`: 用户详情
- `/[status]`: 状态码页面（400, 401, 403, 404, 500, 502, 503）

### API 路由

- `/api/trpc/*`: tRPC API（类型安全的 API）
- `/api/health`: 健康检查
- `/api/hello`: Hello API
- `/api/env`: 环境变量 API

## 开发建议

1. **组件组织**: 按功能组织组件，保持单一职责
2. **类型安全**: 充分利用 TypeScript 类型系统
3. **代码复用**: 提取公共逻辑到 `lib/` 目录
4. **错误处理**: 使用 `error.tsx` 和 `global-error.tsx` 处理错误
5. **状态码页面**: 使用 `/[status]` 路由创建自定义状态码页面
