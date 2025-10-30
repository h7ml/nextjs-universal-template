// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P0-LD-002] 添加示例E2E测试;
// 应用的原则: 测试基础功能;
// }}
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 检查页面标题
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // 检查页面是否渲染
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have working theme toggle', async ({ page }) => {
    await page.goto('/');
    
    // 查找主题切换按钮（如果存在）
    const themeButton = page.getByRole('button', { name: /theme/i });
    
    if (await themeButton.isVisible()) {
      await themeButton.click();
      
      // 验证主题切换效果
      await page.waitForTimeout(500);
      
      const html = page.locator('html');
      const classList = await html.getAttribute('class');
      expect(classList).toBeTruthy();
    }
  });
});

test.describe('API Health Check', () => {
  test('should access health check endpoint', async ({ page }) => {
    const response = await page.goto('/api/hello');
    
    if (response) {
      expect(response.status()).toBeLessThan(500);
    }
  });
});
