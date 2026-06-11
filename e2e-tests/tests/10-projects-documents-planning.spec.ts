import { test, expect } from '@playwright/test';

test.describe('Projects HR (localStorage persistence)', () => {

  test('Projects page loads', async ({ page }) => {
    await page.goto('/projects-hr');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('KPI cards visible', async ({ page }) => {
    await page.goto('/projects-hr');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    const kpis = page.locator('[class*="kpi"], .stat, [class*="stat-card"]').first();
    await expect(kpis).toBeVisible({ timeout: 15000 });
  });

  test('Create project and verify localStorage persistence', async ({ page }) => {
    await page.goto('/projects-hr');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);

    const createBtn = page.locator('button:has-text("New"), button:has-text("Project"), button:has-text("Nouveau"), button:has-text("Create")').first();
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(500);

      const nameInput = page.locator('input[placeholder*="name"], input[placeholder*="nom"], input[name*="name"]').first();
      if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nameInput.fill('Test E2E Project');

        const submitBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create"), button:has-text("Créer")').first();
        if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitBtn.click();
          await page.waitForTimeout(600);
        }

        // Check localStorage has the project
        const stored = await page.evaluate(() => {
          const raw = localStorage.getItem('hr_projects_v1');
          return raw ? JSON.parse(raw) : [];
        });
        const hasProject = stored.some((p: any) => p.name === 'Test E2E Project');
        expect(hasProject, 'Project should be saved in localStorage').toBe(true);

        // Reload and verify it persists
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(800);
        const body = await page.locator('body').textContent();
        expect(body).toContain('Test E2E Project');
      }
    }
  });
});

test.describe('Documents', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/documents');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
  });

  test('Documents page loads', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('Documents list or empty state shown', async ({ page }) => {
    // Use .state-box (page-level empty state) not [class*="empty"] which matches hidden notification panel
    const content = page.locator('table, .state-box, tbody, .table-card, .doc-card').first();
    await expect(content).toBeVisible({ timeout: 20000 });
  });
});

test.describe('Planning', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/planning');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('Planning page loads', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('Calendar or schedule visible', async ({ page }) => {
    const calendar = page.locator('[class*="calendar"], [class*="planner"], table, .fc-view, .fc').first();
    await expect(calendar).toBeVisible({ timeout: 20000 });
  });
});

test.describe('Statistics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/statistics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);
  });

  test('Statistics page loads', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('Charts are rendered', async ({ page }) => {
    const chart = page.locator('canvas, .apexcharts-canvas, svg[class*="chart"], [class*="chart-container"]').first();
    await expect(chart).toBeVisible({ timeout: 20000 });
  });
});

test.describe('Public Holidays', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/public-holidays');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
  });

  test('Public holidays page loads', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('Add holiday button is accessible', async ({ page }) => {
    const btn = page.locator('button:has-text("Add"), button:has-text("Ajouter"), button:has-text("New")').first();
    await expect(btn).toBeVisible({ timeout: 15000 });
  });
});
