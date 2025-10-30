# Bug 修复：退出登录后页面状态未刷新

## 问题描述

用户点击退出登录后，虽然 token 被清除，但页面仍然显示用户登录状态，没有正确刷新为未登录状态。

## 根本原因

退出登录时，虽然执行了以下操作：
1. ✅ 清除了 `localStorage` 中的 `auth_token`
2. ✅ 调用了 `router.push("/login")` 跳转到登录页
3. ✅ 调用了 `router.refresh()` 刷新页面

但是 **React Query 的查询缓存没有被清除**，导致 `trpc.auth.me.useQuery()` 仍然返回缓存的用户数据。

## 解决方案

在 `src/components/layout/Header.tsx` 中：

### 1. 导入 `useQueryClient`

```typescript
import { useQueryClient } from "@tanstack/react-query";
```

### 2. 在组件中获取 queryClient 实例

```typescript
export function Header() {
  const queryClient = useQueryClient();
  // ... 其他代码
}
```

### 3. 修改 `handleLogout` 函数，添加缓存清除

```typescript
const handleLogout = () => {
  // Clear token from localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
  // Close user menu
  setShowUserMenu(false);
  // ⭐ 清除所有 React Query 缓存，确保下次登录时获取新数据
  queryClient.clear();
  // Redirect to login page
  router.push("/login");
  // Force refresh to update the page state
  router.refresh();
};
```

## 修复效果

现在退出登录后：
1. ✅ 清除 localStorage 中的 token
2. ✅ 清除所有 React Query 缓存
3. ✅ 关闭用户菜单
4. ✅ 跳转到登录页
5. ✅ 刷新页面状态
6. ✅ Header 组件正确显示未登录状态
7. ✅ 下次登录时获取全新的用户数据

## 测试步骤

1. 使用测试账号登录（例如：`admin@example.com` / `admin123`）
2. 登录成功后，Header 应显示用户信息和菜单
3. 点击用户头像，打开下拉菜单
4. 点击"退出登录"按钮
5. 验证：
   - ✅ 页面跳转到登录页
   - ✅ Header 显示"登录"按钮（而不是用户信息）
   - ✅ localStorage 中的 `auth_token` 已被清除
   - ✅ 无法访问需要认证的页面（如 `/dashboard`、`/users`）

## 技术细节

### React Query 缓存机制

tRPC 使用 `@tanstack/react-query` 作为底层缓存管理器。当调用 `useQuery` 时，结果会被缓存：

```typescript
const { data: currentUser } = trpc.auth.me.useQuery();
```

即使 localStorage 中的 token 被删除，React Query 仍然会返回缓存的数据，直到：
- 缓存过期（默认 5 分钟）
- 手动清除缓存（`queryClient.clear()`）
- 手动使查询失效（`queryClient.invalidateQueries()`）

### 为什么使用 `queryClient.clear()` 而不是 `invalidateQueries()`

- `queryClient.clear()`: 清除所有查询缓存和状态，确保完全干净的状态
- `queryClient.invalidateQueries()`: 仅标记查询为"过期"，但仍保留缓存数据

对于退出登录场景，使用 `clear()` 更合适，因为：
1. 用户退出后不应该看到任何之前的数据
2. 确保下次登录是完全干净的状态
3. 避免潜在的安全问题（显示其他用户的数据）

## 相关文件

- `src/components/layout/Header.tsx` - 修复退出登录逻辑
- `src/lib/trpc/Provider.tsx` - tRPC Provider 配置
- `src/server/routers/auth.ts` - 认证相关的服务端逻辑

## 额外改进建议

如果需要更精细的控制，可以考虑：

1. **仅清除认证相关的查询**：
```typescript
queryClient.removeQueries({ queryKey: [['auth']] });
```

2. **添加退出登录的 loading 状态**：
```typescript
const [isLoggingOut, setIsLoggingOut] = useState(false);

const handleLogout = async () => {
  setIsLoggingOut(true);
  // ... 退出逻辑
  setIsLoggingOut(false);
};
```

3. **调用服务端的 logout API**（如果需要服务端记录）：
```typescript
const logoutMutation = trpc.auth.logout.useMutation();

const handleLogout = async () => {
  await logoutMutation.mutateAsync();
  // ... 清除缓存和跳转
};
```

---

**修复日期**: 2025-10-30  
**修复人员**: AI Assistant  
**影响范围**: 所有用户的退出登录功能  
**优先级**: 高（影响用户体验）
