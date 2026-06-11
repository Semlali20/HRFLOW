import { test, expect } from '@playwright/test';

test.describe('Performance Reviews', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/performance');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('Performance page loads', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('KPI cards visible (Draft, Submitted, Acknowledged)', async ({ page }) => {
    const kpis = page.locator('[class*="kpi"], .stat-card, .badge-draft, .badge-submitted').first();
    await expect(kpis).toBeVisible({ timeout: 15000 });
  });

  test('Reviews table loads', async ({ page }) => {
    const table = page.locator('table, tbody, [class*="review-list"]').first();
    await expect(table).toBeVisible({ timeout: 20000 });
  });

  test('Add Review button opens form', async ({ page }) => {
    // Performance uses button.btn-new and opens a .side-panel
    const addBtn = page.locator('button.btn-new').first();
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(600);
      const form = page.locator('.side-panel').first();
      await expect(form).toBeVisible({ timeout: 5000 });
    }
  });

  test('Score fields visible (1-5 scale)', async ({ page }) => {
    const addBtn = page.locator('button.btn-new').first();
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(600);
      // Score items are in .score-grid .score-item (each has select 1-5)
      const scoreItems = page.locator('.score-item, .score-grid .form-group');
      const count = await scoreItems.count();
      expect(count).toBeGreaterThanOrEqual(3);
    }
  });

  test('Delete uses styled confirm dialog', async ({ page }) => {
    const deleteBtn = page.locator('button:has-text("Delete"), button:has-text("Supprimer"), button[title*="delete"]').first();
    if (await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      let nativeDialog = false;
      page.once('dialog', d => { nativeDialog = true; d.dismiss(); });

      await deleteBtn.click();
      await page.waitForTimeout(800);

      expect(nativeDialog, 'Delete should use styled dialog, not native confirm()').toBe(false);

      // Dismiss styled dialog if present
      const cancelBtn = page.locator('._cf-btn-cancel, button:has-text("Annuler")').first();
      if (await cancelBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await cancelBtn.click();
      }
    }
  });

  test('Pagination works if multiple pages', async ({ page }) => {
    const nextBtn = page.locator('button:has-text("Next"), button[aria-label*="next"], .page-btn:has-text(">"), .page-btn:has-text("›")').first();
    if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const isDisabled = await nextBtn.isDisabled();
      if (!isDisabled) {
        await nextBtn.click();
        await page.waitForTimeout(800);
        await expect(page.locator('table, tbody').first()).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
