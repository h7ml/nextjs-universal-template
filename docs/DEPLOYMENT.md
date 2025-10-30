# 部署指南

本指南详细说明如何将 Next.js Universal Template 部署到 Vercel 或使用 Docker。

## 📋 目录

- [Vercel 部署](#vercel-部署)
- [Docker 部署](#docker-部署)
- [环境变量配置](#环境变量配置)
- [故障排除](#故障排除)

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
   - 添加其他必需的环境变量（见下文）

5. **部署与自动化**
   - 首次点击 "Deploy" 后，Vercel 会自动构建 `main`（或你设置的分支）
   - 之后每次推送都会触发新构建，无需手动操作

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

## Docker 部署

### 前置条件

- Docker 和 Docker Compose 已安装
- PostgreSQL 数据库（或使用 docker-compose 提供的数据库）

### 使用 Docker Compose（推荐）

1. **配置环境变量**

   创建 `.env` 文件：

   ```env
   # Database
   DATABASE_URL=postgresql://postgres:postgres@db:5432/nextjs_template
   
   # JWT
   JWT_SECRET=your-jwt-secret-min-32-characters-long
   
   # Node Environment
   NODE_ENV=production
   ```

2. **启动服务**

   ```bash
   docker-compose up -d
   ```

3. **查看日志**

   ```bash
   docker-compose logs -f app
   ```

4. **停止服务**

   ```bash
   docker-compose down
   ```

### 使用单独的 Dockerfile

1. **构建镜像**

   ```bash
   docker build -t nextjs-universal-template .
   ```

2. **运行容器**

   ```bash
   docker run -d \
     -p 3000:3000 \
     -e DATABASE_URL="postgresql://user:password@host:5432/database" \
     -e JWT_SECRET="your-jwt-secret" \
     -e NODE_ENV="production" \
     --name nextjs-app \
     nextjs-universal-template
   ```

3. **查看日志**

   ```bash
   docker logs -f nextjs-app
   ```

4. **停止容器**

   ```bash
   docker stop nextjs-app
   docker rm nextjs-app
   ```

### Docker 配置说明

- **Dockerfile**: 多阶段构建，优化镜像大小
- **docker-compose.yml**: 包含应用和 PostgreSQL 数据库
- **健康检查**: 自动检查应用健康状态
- **数据持久化**: 数据库数据存储在 Docker volume 中

---

## 环境变量配置

### Vercel

在项目设置 → Environment Variables 中添加：

```env
# 数据库连接
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT 密钥（至少 32 字符）
JWT_SECRET=your-very-secret-key-min-32-characters-long

# 自定义变量（根据需要）
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Docker

在 `.env` 文件中配置：

```env
# 数据库
DATABASE_URL=postgresql://postgres:postgres@db:5432/nextjs_template

# JWT
JWT_SECRET=your-jwt-secret-min-32-characters-long

# Node 环境
NODE_ENV=production

# 端口（可选）
PORT=3000
```

### 环境变量说明

| 变量名         | 说明                  | 必需 | 示例                             |
| -------------- | --------------------- | ---- | -------------------------------- |
| `DATABASE_URL` | PostgreSQL 连接字符串 | 是   | `postgresql://user:pass@host/db` |
| `JWT_SECRET`   | JWT 密钥（≥32 字符）  | 是   | 随机生成的安全字符串             |
| `NODE_ENV`     | 运行环境              | 否   | `production` / `development`     |
| `PORT`         | 应用端口              | 否   | `3000`（默认）                   |

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

**问题**: 数据库连接失败

- 确认 `DATABASE_URL` 环境变量正确设置
- 检查数据库是否允许外部连接
- 推荐使用 Vercel Postgres 或 Neon Serverless

### Docker 部署问题

**问题**: 容器无法启动

- 检查环境变量是否正确配置
- 查看容器日志：`docker logs nextjs-app`
- 确认端口 3000 没有被占用

**问题**: 数据库连接失败

- 确认数据库容器正在运行：`docker-compose ps`
- 检查 `DATABASE_URL` 中的主机名（Docker Compose 中使用 `db`）
- 验证数据库凭据

**问题**: 构建失败

- 清理 Docker 缓存：`docker system prune -a`
- 检查 Dockerfile 中的构建步骤
- 确认所有依赖可以正常安装

**问题**: 性能问题

- 确保生产构建：`NODE_ENV=production`
- 检查容器资源限制
- 考虑使用 Docker Compose 的资源配置

---

## 🎯 最佳实践

### 通用最佳实践

1. **环境变量安全**
   - 使用 `NEXT_PUBLIC_*` 前缀暴露客户端变量
   - 敏感信息只在服务端使用
   - 不要在代码中硬编码敏感信息

2. **数据库管理**
   - 定期备份数据库
   - 使用强密码
   - 限制数据库访问权限

3. **监控和日志**
   - 设置错误监控（如 Sentry）
   - 定期查看应用日志
   - 配置健康检查端点

### Vercel 特定实践

1. **自动部署**
   - 使用 GitHub 集成实现 CI/CD
   - 为不同分支配置不同环境
   - 利用预览部署测试 PR

2. **性能优化**
   - 启用 Edge Runtime
   - 使用 Vercel Analytics
   - 配置适当的缓存策略

### Docker 特定实践

1. **镜像优化**
   - 使用多阶段构建减小镜像体积
   - 利用构建缓存加速构建
   - 定期更新基础镜像

2. **容器管理**
   - 使用 Docker Compose 管理多容器应用
   - 配置健康检查
   - 设置资源限制

3. **生产部署**
   - 使用 orchestration 工具（如 Kubernetes）
   - 配置负载均衡
   - 实现滚动更新

---

## 📞 获取帮助

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Docker**: [docs.docker.com](https://docs.docker.com)
- **项目问题**: [GitHub Issues](https://github.com/h7ml/nextjs-universal-template/issues)

---

**最后更新**: 2025-10-30
