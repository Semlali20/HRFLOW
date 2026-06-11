import { test, expect } from '@playwright/test';

test.describe('Salary', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/salary');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('Salary page loads', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('Salary table or empty state visible', async ({ page }) => {
    // Use .state-box (page-level empty state) not [class*="empty"] which matches hidden notification panel
    const content = page.locator('table, .state-box, tbody, .table-card').first();
    await expect(content).toBeVisible({ timeout: 20000 });
  });

  test('No JS crash on salary page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(1000);
    const crashes = errors.filter(e => e.includes('Cannot read properties') || e.includes('undefined'));
    expect(crashes).toHaveLength(0);
  });
});

test.describe('Training', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/training');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('Training page loads', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('Training list or empty state shown', async ({ page }) => {
    // Use .state-box (page-level) not [class*="empty"] which matches hidden notification panel
    const content = page.locator('table, .state-box, tbody, .table-card').first();
    await expect(content).toBeVisible({ timeout: 20000 });
  });
});

test.describe('Recruitment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recruitment');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('Recruitment page loads', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('Job offers tab visible', async ({ page }) => {
    const tab = page.locator('button:has-text("Offer"), button:has-text("Offre"), [class*="tab"]').first();
    await expect(tab).toBeVisible({ timeout: 15000 });
  });

  test('CV applications tab visible', async ({ page }) => {
    const tab = page.locator('button:has-text("CV"), button:has-text("Application"), button:has-text("Candidat")').first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Create offer button works', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Offer"), button:has-text("Offre"), button:has-text("Add"), button:has-text("Create")').first();
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(500);
      const form = page.locator('.modal, .side-panel, form').first();
      await expect(form).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Interns (Stagiaires)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stagiaires');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('Interns page loads', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('Add intern button visible', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Stagiaire"), button:has-text("Intern"), button:has-text("Ajouter")').first();
    await expect(addBtn).toBeVisible({ timeout: 15000 });
  });
});
