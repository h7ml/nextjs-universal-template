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

## 注意事项

- 这些脚本需要相应的环境变量和工具已配置
- `fix-db.*` 脚本应在数据库迁移前运行（如果需要）
- 确保备份数据库后再运行修复脚本

---

**最后更新**: 2025-10-30
