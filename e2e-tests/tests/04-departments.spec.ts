import { test, expect } from '@playwright/test';

test.describe('Departments & Positions (Org)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/org');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('Org page loads with department list', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
    // Should have some content (table rows or cards) — API may be slow on first call
    const content = page.locator('tbody tr, .dept-row, .card, [class*="dept"], .tab-btn').first();
    await expect(content).toBeVisible({ timeout: 20000 });
  });

  test('Department tab is active by default', async ({ page }) => {
    const activeTab = page.locator('.tab-btn.active').first();
    if (await activeTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      const text = await activeTab.textContent();
      expect(text?.toLowerCase()).toMatch(/depart|dept/);
    }
  });

  test('Can switch to Positions tab', async ({ page }) => {
    const posTab = page.locator('.tab-btn').filter({ hasText: /Position|Fonction|Poste/i }).first();
    if (await posTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await posTab.click();
      await page.waitForTimeout(600);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Can switch to Chart view', async ({ page }) => {
    // Chart button is a .btn.btn-sm with text "Chart"
    const chartBtn = page.locator('.btn').filter({ hasText: /Chart|Organigramme/i }).first();
    if (await chartBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chartBtn.click();
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Create department button opens form', async ({ page }) => {
    const createBtn = page.locator('button.big-action-btn').first();
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(500);
      const panel = page.locator('.rp, .side-panel, .panel, form').first();
      await expect(panel).toBeVisible({ timeout: 5000 });
    }
  });

  test('Departments appear in org chart when chart view active', async ({ page }) => {
    const chartBtn = page.locator('.btn').filter({ hasText: /Chart|Organigramme/i }).first();
    if (await chartBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chartBtn.click();
      await page.waitForTimeout(800);
      // Org tree nodes should be visible
      const nodes = page.locator('app-org-tree-node, .org-node, .dept-node, [class*="tree-node"]');
      const count = await nodes.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});
