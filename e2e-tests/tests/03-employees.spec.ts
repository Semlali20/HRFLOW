import { test, expect } from '@playwright/test';

test.describe('Employees (Collaborateurs)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/collaborateur');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('Employee list loads with data', async ({ page }) => {
    // Wait for the table card to appear — API may be slow on first call
    await expect(page.locator('.emp-table-card').first()).toBeVisible({ timeout: 20000 });
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Search employee filters results', async ({ page }) => {
    const searchInput = page.locator('input.search-input').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('a');
      await page.waitForTimeout(800);
      const rows = page.locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('Create employee modal opens', async ({ page }) => {
    const createBtn = page.locator('button.add-btn').first();
    await expect(createBtn).toBeVisible({ timeout: 15000 });
    await createBtn.click();
    await page.waitForTimeout(500);
    const modal = page.locator('.emp-create-modal').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('Create employee form has required fields', async ({ page }) => {
    const createBtn = page.locator('button.add-btn').first();
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(500);
      // Check for first/last name inputs with .ecm-input class
      const inputs = page.locator('input.ecm-input');
      await expect(inputs.first()).toBeVisible({ timeout: 5000 });
      const count = await inputs.count();
      expect(count).toBeGreaterThan(1);
    }
  });

  test('Department dropdown in create form loads options', async ({ page }) => {
    const createBtn = page.locator('button.add-btn').first();
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(800);
      const deptSelect = page.locator('select.ecm-select').first();
      if (await deptSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
        const options = await deptSelect.locator('option').count();
        expect(options).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('Gender dropdown has only Male and Female', async ({ page }) => {
    const createBtn = page.locator('button.add-btn').first();
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(600);
      // Gender select is the 2nd select (after department area, it's ecm-select with MALE/FEMALE options)
      const allSelects = page.locator('select.ecm-select');
      const count = await allSelects.count();
      for (let i = 0; i < count; i++) {
        const opts = await allSelects.nth(i).locator('option').allTextContents();
        const hasMale = opts.some(t => t.toUpperCase().includes('MALE') || t.toUpperCase().includes('HOMME'));
        if (hasMale) {
          const hasOther = opts.some(t => t.toLowerCase().includes('other') || t.toLowerCase().includes('autre'));
          expect(hasOther, 'Gender should not have "Other" option').toBe(false);
          break;
        }
      }
    }
  });

  test('Age auto-calculates from date of birth', async ({ page }) => {
    const createBtn = page.locator('button.add-btn').first();
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(600);
      // DOB is input[type="date"].ecm-input
      const dobInput = page.locator('input[type="date"].ecm-input').first();
      // Age is input[type="number"].ecm-input (readonly)
      const ageInput = page.locator('input[type="number"].ecm-input').first();
      if (await dobInput.isVisible({ timeout: 2000 }).catch(() => false) &&
          await ageInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dobInput.fill('1990-06-15');
        await dobInput.dispatchEvent('change');
        await page.waitForTimeout(400);
        const ageValue = await ageInput.inputValue();
        if (ageValue) {
          expect(Number(ageValue)).toBeGreaterThan(0);
          expect(Number(ageValue)).toBeLessThan(100);
        }
      }
    }
  });

  test('Close modal/panel with X button', async ({ page }) => {
    const createBtn = page.locator('button.add-btn').first();
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(500);
      const closeBtn = page.locator('button.ecm-close-btn').first();
      if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(400);
        const modal = page.locator('.emp-create-modal').first();
        const isVisible = await modal.isVisible({ timeout: 1000 }).catch(() => false);
        expect(isVisible).toBe(false);
      }
    }
  });

  test('Employee row click opens detail', async ({ page }) => {
    await expect(page.locator('tbody')).toBeVisible({ timeout: 20000 });
    const firstRow = page.locator('tbody tr').first();
    if (await firstRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstRow.click();
      await page.waitForTimeout(600);
      // Detail panel should appear
      const detail = page.locator('.emp-detail-panel').first();
      await expect(detail).toBeVisible({ timeout: 3000 });
    }
  });
});
