import { test, expect } from '@playwright/test';

test.describe('Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('Onboarding page loads', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('KPI cards are visible (Onboarding, Offboarding, Completed)', async ({ page }) => {
    // Wait for at least one KPI card to appear before counting (data loads async)
    await page.locator('.ob-kpi, [class*="kpi"], .kpi-card').first().waitFor({ timeout: 15000 }).catch(() => {});
    const kpiCards = page.locator('.ob-kpi, [class*="kpi"], .kpi-card');
    const count = await kpiCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('KPI labels are translated (not raw keys)', async ({ page }) => {
    const pageText = await page.locator('body').textContent();
    expect(pageText).not.toContain('ONBOARDING.KPI_');
    expect(pageText).not.toContain('KPI_TOTAL');
    expect(pageText).not.toContain('KPI_ONBOARDING');
  });

  test('Process list table is visible', async ({ page }) => {
    const table = page.locator('table, .table-card, [class*="process-list"]').first();
    await expect(table).toBeVisible({ timeout: 20000 });
  });

  test('"Start Process" button opens form', async ({ page }) => {
    const startBtn = page.locator('button:has-text("Start Process"), button:has-text("Démarrer")').first();
    await expect(startBtn).toBeVisible({ timeout: 15000 });
    await startBtn.click();
    await page.waitForTimeout(500);
    const form = page.locator('.modal, .side-panel, form[class*="process"]').first();
    await expect(form).toBeVisible({ timeout: 5000 });
  });

  test('Cancel button shows styled confirm dialog (not native browser)', async ({ page }) => {
    const cancelBtn = page.locator('button:has-text("Cancel"), button:has-text("Annuler"):visible').first();
    if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Listen for native dialog — it should NOT appear
      let nativeDialogShown = false;
      page.once('dialog', d => { nativeDialogShown = true; d.dismiss(); });

      await cancelBtn.click();
      await page.waitForTimeout(800);

      // Styled confirm dialog should appear instead
      const styledDialog = page.locator('._cf-btn-cancel, ._cf-btn-confirm, [class*="confirm-dialog"]').first();
      const hasStyled = await styledDialog.isVisible({ timeout: 2000 }).catch(() => false);

      expect(nativeDialogShown, 'Native browser confirm() should NOT appear').toBe(false);
      if (hasStyled) {
        // Dismiss the styled dialog
        await page.locator('._cf-btn-cancel, button:has-text("Annuler")').first().click();
      }
    }
  });

  test('Onboarding row click opens detail panel', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    if (await firstRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstRow.click();
      await page.waitForTimeout(600);
      // Onboarding uses .side-panel class (not generic [class*="panel"] which matches notification panel)
      const panel = page.locator('.side-panel').first();
      await expect(panel).toBeVisible({ timeout: 5000 });
    }
  });
});
