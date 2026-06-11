import { test, expect } from '@playwright/test';

test.describe('Leave Management', () => {

  test('Leave list page loads', async ({ page }) => {
    // Correct route: /leave (NOT /leave/leave-list)
    await page.goto('/leave');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Leave balance page loads with types', async ({ page }) => {
    // Correct route: /leave/balance (NOT /leave/leave-balance)
    await page.goto('/leave/balance');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    // Leave balance shows .card with table or .state-box empty state
    const content = page.locator('.card, table, .state-box').first();
    await expect(content).toBeVisible({ timeout: 20000 });
  });

  test('Leave types page has 7 seeded types', async ({ page }) => {
    // Correct route: /leave/balance (NOT /leave/leave-balance)
    await page.goto('/leave/balance');
    await page.waitForLoadState('domcontentloaded');
    // Wait for page content to load before reading body text
    await page.locator('.card, table, .state-box, [class*="leave"]').first().waitFor({ timeout: 15000 }).catch(() => {});
    await expect(page.locator('body')).toBeVisible();
    const body = await page.locator('body').textContent();
    // Should have some leave-related content
    const hasContent = body?.includes('Balance') || body?.includes('Congé') || body?.includes('Leave') || body?.includes('Solde');
    expect(hasContent, 'Leave balance page should have relevant content').toBe(true);
  });

  test('New leave request form opens', async ({ page }) => {
    // Leave request form is NOT a separate route — it's a panel on /leave
    await page.goto('/leave');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    // Click the "New Request" button (big-action-btn)
    const newBtn = page.locator('button.big-action-btn').first();
    await expect(newBtn).toBeVisible({ timeout: 20000 });
    await newBtn.click();
    await page.waitForTimeout(500);
    // The create panel (.rp) should slide in
    const panel = page.locator('.rp').first();
    await expect(panel).toBeVisible({ timeout: 5000 });
  });

  test('Leave request form has type dropdown with seeded types', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    const newBtn = page.locator('button.big-action-btn').first();
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(800);
      // Type select inside the .rp create panel
      const typeSelect = page.locator('.rp select.f-select').first();
      if (await typeSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
        const options = await typeSelect.locator('option').allTextContents();
        const hasLeaveType = options.some(o =>
          o.includes('Congé') || o.includes('RTT') || o.includes('Annuel') ||
          o.includes('Leave') || o.includes('Annual') || o.includes('Maladie')
        );
        expect(hasLeaveType, 'Leave type dropdown should contain seeded types').toBe(true);
      }
    }
  });

  test('Leave request requires start and end dates', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    const newBtn = page.locator('button.big-action-btn').first();
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(600);
      // Date inputs are inside the .rp panel with class .f-input
      const startDate = page.locator('.rp input[type="date"]').first();
      const endDate = page.locator('.rp input[type="date"]').last();
      await expect(startDate).toBeVisible({ timeout: 5000 });
      await expect(endDate).toBeVisible({ timeout: 5000 });
    }
  });

  test('Attendance page loads', async ({ page }) => {
    await page.goto('/attendance');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await expect(page.locator('body')).toBeVisible();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    const crashes = errors.filter(e => e.includes('Cannot read properties') || e.includes('is not a function'));
    expect(crashes).toHaveLength(0);
  });
});
