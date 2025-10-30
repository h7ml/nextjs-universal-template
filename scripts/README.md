# 工具脚本说明

## 可用脚本

### `fix-db.ts` / `fix-db.sql`

修复数据库结构问题，移除旧的 UserRole enum 类型。

**使用场景**: 当数据库迁移遇到 "cannot drop type UserRole" 错误时。

**使用方法**:

```bash
# 方法 1: 运行 TypeScript 脚本（推荐）
pnpm db:fix

# 方法 2: 直接在数据库中运行 SQL
psql $DATABASE_URL < scripts/fix-db.sql
```

### `deploy.sh`

多平台部署脚本，支持 Vercel、Cloudflare Pages 和 Deno Deploy。

**使用方法**:

```bash
./scripts/deploy.sh vercel      # 部署到 Vercel
./scripts/deploy.sh cloudflare  # 部署到 Cloudflare Pages
./scripts/deploy.sh deno        # 部署到 Deno Deploy
```

### `test-deno.sh`

测试 Deno 服务器配置，检查构建文件是否存在。

**使用方法**:

```bash
./scripts/test-deno.sh
```

## 注意事项

- 这些脚本需要相应的环境变量和工具已配置
- `fix-db.*` 脚本应在数据库迁移前运行（如果需要）
- 部署脚本需要相应的 CLI 工具已安装
