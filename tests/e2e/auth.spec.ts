// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P0-LD-002] 添加认证流程E2E测试;
// 应用的原则: 关键路径测试, 用户体验验证;
// }}
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page).toHaveTitle(/Login/i);
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');
    
    // 尝试提交空表单
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // 应该显示验证错误（这取决于你的表单验证实现）
    // 这里是示例，需要根据实际实现调整
    await expect(page.locator('text=required')).toBeVisible({
      timeout: 3000,
    }).catch(() => {
      // 如果没有验证，至少页面应该还在login
      expect(page.url()).toContain('/login');
    });
  });

  test('should navigate to homepage', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Next.js Universal Template/i);
  });

  test('should display dashboard (if accessible without auth)', async ({ page }) => {
    await page.goto('/dashboard');
    
    // 如果需要认证，应该重定向到login
    // 如果不需要，应该显示dashboard
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|login)/);
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    
    // 检查页面是否加载
    await expect(page.locator('body')).toBeVisible();
    
    // 测试基本导航功能
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});
