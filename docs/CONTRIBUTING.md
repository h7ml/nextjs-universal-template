# 贡献指南

感谢您考虑为 Next.js Universal Template 做贡献！

## 如何贡献

### 报告问题

如果您发现了 bug 或有功能建议，请：

1. 检查 [Issues](https://github.com/h7ml/nextjs-universal-template/issues) 中是否已经有相关问题
2. 如果不存在，请创建新 issue，并包含：
   - 清晰的问题描述
   - 复现步骤（如果是 bug）
   - 预期行为 vs 实际行为
   - 环境信息（操作系统、Node.js 版本等）

### 提交代码

1. **Fork 项目**

   ```bash
   git clone git@github.com:h7ml/nextjs-universal-template.git
   cd nextjs-universal-template
   ```

2. **创建分支**

   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **设置开发环境**

   ```bash
   pnpm install
   cp .env.example .env.local
   # 编辑 .env.local 配置数据库等
   ```

4. **进行更改**
   - 遵循项目的代码风格（使用 Prettier）
   - 添加必要的注释和文档
   - 确保代码通过 lint 检查：`pnpm lint`
   - 确保类型检查通过：`pnpm type-check`

5. **提交更改**

   ```bash
   git add .
   git commit -m "feat: 添加新功能"  # 使用语义化提交信息
   git push origin feature/your-feature-name
   ```

6. **创建 Pull Request**
   - 填写 PR 描述，说明更改的内容和原因
   - 关联相关的 issue（如果有）
   - 等待代码审查

## 代码规范

### 提交信息格式

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更改
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：

```
feat: 添加用户认证功能
fix: 修复 Deno 服务器 404 错误
docs: 更新部署文档
```

### 代码风格

- 使用 TypeScript
- 使用 2 空格缩进
- 使用单引号（JavaScript/TypeScript）
- 使用尾随逗号
- 组件使用 PascalCase，文件使用 kebab-case 或 camelCase

### 文件组织

```
src/
  app/          # Next.js App Router 页面
  components/   # React 组件
  lib/          # 工具函数和配置
  server/       # 服务器端代码（tRPC）
  db/           # 数据库相关
  types/        # TypeScript 类型定义
```

## 开发流程

### 本地开发

```bash
# Next.js 开发服务器
pnpm dev

# 类型检查
pnpm type-check

# Lint
pnpm lint

# 格式化
pnpm format
```

### 测试

提交 PR 前请确保：

- [ ] 代码通过 lint 检查
- [ ] 类型检查通过
- [ ] 构建成功：`pnpm build`
- [ ] 功能正常工作

## 部署相关

### 多平台支持

本模板支持以下平台的部署：

- **Vercel**: 推荐，完整 Next.js 支持，零配置部署
- **Docker**: 容器化部署，适合自有服务器和私有云环境

请确保在不同平台的兼容性，详见 `docs/` 目录中的部署文档。

## 问题和帮助

如果您有任何问题，请：

- 查看现有文档
- 搜索已有的 issue
- 创建新的 issue 寻求帮助

再次感谢您的贡献！🎉
