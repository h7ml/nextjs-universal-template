<div align="center">

# 🚀 Next.js Universal Template

**一个支持 Vercel 和 Docker 部署的全栈 Next.js 模板**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9-orange?logo=pnpm)](https://pnpm.io/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/h7ml/nextjs-universal-template)

---

</div>

## ✨ 特性

<div align="center">

### 🎯 核心特性

</div>

<table>
<tr>
<td width="50%">

**🔧 开发体验**

- ✅ **Next.js 14** App Router
- ✅ **TypeScript** 完整类型支持
- ✅ **Edge Runtime** 多平台兼容
- ✅ **热重载** 开发体验
- ✅ **代码规范** ESLint + Prettier

</td>
<td width="50%">

**🚀 生产就绪**

- ✅ **tRPC** 类型安全 API
- ✅ **JWT 认证** 完整实现
- ✅ **Drizzle ORM** + PostgreSQL
- ✅ **多平台部署** Vercel/Docker
- ✅ **响应式设计** Tailwind CSS
- ✅ **状态码页面** 404/500 等

</td>
</tr>
<tr>
<td width="50%">

**📊 数据可视化**

- ✅ **ECharts** 丰富图表
- ✅ **Recharts** 灵活组件
- ✅ **数据看板** 完整功能
- ✅ **多种图表类型** 支持

</td>
<td width="50%">

**🎨 UI/UX**

- ✅ **Radix UI** 无障碍组件
- ✅ **深色模式** 自动切换
- ✅ **主题系统** 可定制
- ✅ **完整 CRUD** 示例代码

</td>
</tr>
</table>

## 🏗️ 技术栈

<div align="center">

### 📦 核心技术

</div>

<table>
<tr>
<td align="center" width="33%">

**🎨 前端框架**

<br>

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)

<br>

![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix%20UI-161618?logo=radix-ui&logoColor=white)

</td>
<td align="center" width="34%">

**⚙️ 后端技术**

<br>

![tRPC](https://img.shields.io/badge/tRPC-11.6-2596BE?logo=trpc)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.44-orange)

<br>

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-认证-yellow)
![Edge Runtime](https://img.shields.io/badge/Edge%20Runtime-支持-green)

</td>
<td align="center" width="33%">

**☁️ 部署平台**

<br>

![Vercel](https://img.shields.io/badge/Vercel-完整支持-000000?logo=vercel)
![Docker](https://img.shields.io/badge/Docker-完整支持-2496ED?logo=docker&logoColor=white)

</td>
</tr>
</table>

<details>
<summary><b>📚 完整依赖列表</b></summary>

**前端库**

- `next@^14.2.0` - Next.js 框架
- `react@^18.3.1` - React 库
- `tailwindcss@^3.4.13` - CSS 框架
- `@radix-ui/*` - UI 组件库
- `lucide-react` - 图标库
- `framer-motion` - 动画库

**数据可视化**

- `echarts@^5.5.0` - ECharts 图表库
- `recharts@^2.15.2` - Recharts 图表库

**后端库**

- `@trpc/server@^11.6.0` - tRPC 服务端
- `drizzle-orm@^0.44.5` - ORM 框架
- `jose@^6.1.0` - JWT 处理
- `zod@^3.23.8` - 数据验证
- `superjson@^1.13.3` - 序列化

**数据库**

- `@neondatabase/serverless@^1.0.2` - Neon 数据库客户端

</details>

## 🚀 快速开始

<div align="center">

### ⚡ 5 分钟快速上手

</div>

### 📋 前置要求

| 工具           | 版本 | 说明                                          |
| -------------- | ---- | --------------------------------------------- |
| **Node.js**    | 18+  | 推荐使用 20.x                                 |
| **PostgreSQL** | -    | 或使用 [Neon Cloud](https://neon.tech) (免费) |
| **包管理器**   | -    | npm / pnpm / yarn                             |

### 🔧 安装步骤

<details>
<summary><b>📦 1. 克隆并安装依赖</b></summary>

```bash
# 克隆仓库
git clone git@github.com:h7ml/nextjs-universal-template.git
cd nextjs-universal-template

# 安装依赖（推荐使用 pnpm）
pnpm install
# 或
npm install
```

</details>

<details>
<summary><b>🔐 2. 配置环境变量</b></summary>

```bash
# 复制环境变量模板
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# 数据库连接（Neon 免费: https://neon.tech）
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT 密钥（生产环境请使用强密钥）
# 生成命令: openssl rand -base64 32
JWT_SECRET=your-very-secret-key-min-32-chars

# 环境模式
NODE_ENV=development
```

</details>

<details>
<summary><b>🗄️ 3. 初始化数据库</b></summary>

```bash
# 推送 Schema 到数据库
pnpm db:push

# 填充示例数据（可选）
pnpm db:seed
```

</details>

<details>
<summary><b>▶️ 4. 启动开发服务器</b></summary>

```bash
# 启动 Next.js 开发服务器
pnpm dev

# 访问 http://localhost:3000
```

**测试账号**（来自 seed 数据）：

- 管理员: `admin@example.com` / `admin123`
- 用户: `user@example.com` / `user123`

</details>

---

<div align="center">

**🎉 完成！现在可以开始开发了！**

</div>

## 📁 项目结构

<div align="center">

### 📂 目录组织

</div>

```
nextjs-universal-template/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/             # API Routes
│   │   │   └── trpc/        # tRPC API handler
│   │   ├── dashboard/       # 数据看板页面
│   │   ├── login/           # 登录/注册页面
│   │   ├── users/           # 用户管理页面
│   │   ├── dashboards/     # 看板管理页面
│   │   └── layout.tsx      # 根布局
│   ├── components/         # React 组件
│   │   ├── charts/         # 图表组件
│   │   ├── ui/             # UI 组件库
│   │   └── ...             # 其他组件
│   ├── db/                 # 数据库
│   │   ├── schema.ts       # Drizzle Schema
│   │   └── index.ts        # 数据库连接
│   ├── server/             # 服务端代码
│   │   ├── routers/        # tRPC Routers
│   │   ├── context.ts      # tRPC Context
│   │   └── trpc.ts         # tRPC 配置
│   ├── lib/                # 工具库
│   │   ├── platform.ts     # 平台检测
│   │   ├── env.ts          # 环境变量管理
│   │   ├── trpc/           # tRPC Client
│   │   └── utils.ts        # 工具函数
│   └── types/              # TypeScript 类型
├── drizzle.config.ts       # Drizzle 配置
├── docker-compose.yml      # Docker Compose
├── Dockerfile             # Docker 配置
├── next.config.js          # Next.js 配置
├── tailwind.config.ts      # Tailwind 配置
└── package.json
```

## 📊 功能模块

<div align="center">

### 🎯 核心功能

</div>

<table>
<tr>
<td width="33%" align="center">

### 🔐 认证系统

- ✅ 用户注册/登录
- ✅ JWT Token 认证
- ✅ 自动 Token 刷新
- ✅ 权限控制 (RBAC)
- ✅ 密码修改功能

</td>
<td width="34%" align="center">

### 📊 数据看板

- ✅ 创建/编辑/删除看板
- ✅ 多种图表类型
- ✅ ECharts + Recharts
- ✅ 响应式布局
- ✅ 数据源管理

</td>
<td width="33%" align="center">

### 👥 用户管理

- ✅ 用户列表查询
- ✅ 用户信息更新
- ✅ 用户删除 (Admin)
- ✅ 角色权限管理
- ✅ 个人资料编辑

</td>
</tr>
</table>

## 🎨 UI 组件库

<div align="center">

### 🧩 开箱即用的组件

</div>

<table>
<tr>
<td width="25%" align="center">

**Button**  
多尺寸、多样式按钮

</td>
<td width="25%" align="center">

**Card**  
灵活的卡片容器

</td>
<td width="25%" align="center">

**Input**  
表单输入组件

</td>
<td width="25%" align="center">

**ThemeToggle**  
深色模式切换

</td>
</tr>
<tr>
<td width="25%" align="center">

**Dialog**  
模态对话框

</td>
<td width="25%" align="center">

**Dropdown**  
下拉菜单

</td>
<td width="25%" align="center">

**Tabs**  
标签页组件

</td>
<td width="25%" align="center">

**Tooltip**  
提示工具

</td>
</tr>
</table>

> 💡 所有组件基于 **Radix UI** 和 **Tailwind CSS**，易于扩展和定制

## 📦 部署

<div align="center">

### ☁️ 部署选项

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/h7ml/nextjs-universal-template)

</div>

<table>
<tr>
<td width="50%">

### ⚡ Vercel (推荐)

**特点**: 完整 Next.js 支持，零配置部署

```bash
# 方法 1: GitHub 连接（推荐）
# 1. 推送代码到 GitHub
# 2. 在 Vercel 导入项目
# 3. 配置环境变量
# 4. 自动部署完成！

# 方法 2: CLI 部署
npm i -g vercel
vercel --prod
```

**优势**:

- ✅ 完整的 SSR/SSG 支持
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 零配置部署

📖 [详细文档](./docs/DEPLOYMENT.md#vercel-部署)

</td>
<td width="50%">

### 🐳 Docker

**特点**: 容器化部署，可移植性强

```bash
# 使用 Docker Compose（推荐）
docker-compose up -d

# 或单独构建
docker build -t nextjs-template .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  nextjs-template
```

**适用场景**:

- ✅ 自有服务器部署
- ✅ 私有云环境
- ✅ 开发环境统一
- ✅ Kubernetes 部署

📖 [详细文档](./docs/DEPLOYMENT.md#docker-部署)

</td>
</tr>
</table>

<div align="center">

📚 [完整部署指南](./docs/DEPLOYMENT.md)

</div>

## 🔧 开发脚本

<div align="center">

### ⚙️ 常用命令

</div>

<table>
<tr>
<td width="33%">

**🚀 开发**

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
```

</td>
<td width="34%">

**🔍 代码质量**

```bash
pnpm lint         # ESLint 检查
pnpm type-check   # TypeScript 检查
pnpm format       # Prettier 格式化
```

</td>
<td width="33%">

**🗄️ 数据库**

```bash
pnpm db:generate  # 生成迁移
pnpm db:push      # 推送 Schema
pnpm db:migrate   # 运行迁移
pnpm db:studio    # Drizzle Studio
pnpm db:seed      # 填充数据
```

</td>
</tr>
</table>

## 📚 数据库和 API

<details>
<summary><b>🗄️ 数据库 Schema</b></summary>

所有表使用 `universal_` 前缀：

- `universal_users` - 用户表
- `universal_roles` - 角色表
- `universal_sessions` - 会话表
- `universal_dashboards` - 看板表
- `universal_widgets` - 组件表
- `universal_data_sources` - 数据源表

</details>

<details>
<summary><b>📡 tRPC API 端点</b></summary>

**认证**

- `auth.register` - 注册用户
- `auth.login` - 登录
- `auth.me` - 获取当前用户

**用户管理**

- `user.list` - 获取用户列表
- `user.getById` - 获取用户详情
- `user.updateProfile` - 更新用户资料

**看板管理**

- `dashboard.list` - 获取看板列表
- `dashboard.getById` - 获取看板详情
- `dashboard.create` - 创建看板
- `dashboard.update` - 更新看板
- `dashboard.delete` - 删除看板

</details>

<details>
<summary><b>🔒 安全注意事项</b></summary>

- ✅ 使用强 JWT Secret（32+ 字符）
- ✅ 密码哈希存储（建议：bcrypt/argon2）
- ✅ 环境变量不暴露敏感信息
- ✅ API 路由权限控制（RBAC）
- ✅ HTTPS 加密传输
- ⚠️ 生产环境请更换默认密钥

</details>

## 🌍 部署方式对比

<div align="center">

### 📊 功能支持矩阵

</div>

<table>
<thead>
<tr>
<th align="center">特性</th>
<th align="center">Vercel</th>
<th align="center">Docker</th>
</tr>
</thead>
<tbody>
<tr>
<td align="center"><strong>Next.js SSR</strong></td>
<td align="center">✅ <strong>完整</strong></td>
<td align="center">✅ <strong>完整</strong></td>
</tr>
<tr>
<td align="center"><strong>API Routes</strong></td>
<td align="center">✅ <strong>完整</strong></td>
<td align="center">✅ <strong>完整</strong></td>
</tr>
<tr>
<td align="center"><strong>Edge Runtime</strong></td>
<td align="center">✅ <strong>支持</strong></td>
<td align="center">✅ 支持</td>
</tr>
<tr>
<td align="center"><strong>tRPC</strong></td>
<td align="center">✅ <strong>完整</strong></td>
<td align="center">✅ <strong>完整</strong></td>
</tr>
<tr>
<td align="center"><strong>数据库连接</strong></td>
<td align="center">✅ <strong>完整</strong></td>
<td align="center">✅ <strong>完整</strong></td>
</tr>
<tr>
<td align="center"><strong>部署难度</strong></td>
<td align="center">⭐ <strong>最简单</strong></td>
<td align="center">⭐⭐ 简单</td>
</tr>
<tr>
<td align="center"><strong>免费额度</strong></td>
<td align="center">✅ 充足</td>
<td align="center">➖ 自行管理</td>
</tr>
<tr>
<td align="center"><strong>自动扩展</strong></td>
<td align="center">✅ <strong>自动</strong></td>
<td align="center">⚙️ 需配置</td>
</tr>
<tr>
<td align="center"><strong>CDN</strong></td>
<td align="center">✅ <strong>全球</strong></td>
<td align="center">❌ 需额外配置</td>
</tr>
</tbody>
</table>

<div align="center">

💡 **推荐**: 生产环境使用 **Vercel**（零配置，自动扩展），自有服务器使用 **Docker**

</div>

## 🤝 贡献

<div align="center">

### 💝 欢迎贡献！

我们欢迎所有形式的贡献，包括但不限于：

</div>

<table>
<tr>
<td width="50%" align="center">

**🐛 报告问题**

- Bug 报告
- 功能建议
- 文档改进

</td>
<td width="50%" align="center">

**💻 代码贡献**

- 修复 Bug
- 新功能开发
- 性能优化

</td>
</tr>
</table>

<div align="center">

📖 [查看贡献指南](./docs/CONTRIBUTING.md) · 📁 [项目结构说明](./docs/PROJECT_STRUCTURE.md)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Contributors](https://img.shields.io/github/contributors/h7ml/nextjs-universal-template)](https://github.com/h7ml/nextjs-universal-template/graphs/contributors)

</div>

## 📄 许可证

<div align="center">

本项目采用 [MIT License](./LICENSE) 开源协议。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## 🔗 相关链接

<div align="center">

### 📚 官方文档和资源

</div>

<table>
<tr>
<td align="center" width="33%">

**框架文档**

[Next.js](https://nextjs.org/docs)  
[tRPC](https://trpc.io)  
[React](https://react.dev)

</td>
<td align="center" width="34%">

**工具文档**

[Drizzle ORM](https://orm.drizzle.team)  
[TypeScript](https://www.typescriptlang.org)  
[Tailwind CSS](https://tailwindcss.com)

</td>
<td align="center" width="33%">

**部署平台**

[Vercel](https://vercel.com/docs)  
[Docker](https://docs.docker.com)

</td>
</tr>
</table>

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请考虑给它一个 Star！**

📅 **最后更新**: 2025-01-30  
📧 **问题反馈**: [GitHub Issues](https://github.com/h7ml/nextjs-universal-template/issues)

---

**Made with ❤️ by the community**

</div>
