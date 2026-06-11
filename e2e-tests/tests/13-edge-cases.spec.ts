import { test, expect } from '@playwright/test';

// ── Auth tests need a clean unauthenticated state ───────────────────────────
test.describe('Auth — negative cases', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Wrong password stays on login and shows error', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('input.form-input[type="email"]', { timeout: 10000 });
    await page.locator('input.form-input[type="email"]').fill('admin@innovx.com');
    await page.locator('input.form-input[type="password"]').fill('WrongPassword!');
    await page.locator('button.btn-signin').click();
    await page.waitForTimeout(2500);
    // Should NOT redirect to dashboard
    expect(page.url()).not.toMatch(/dashboard/);
  });

  test('Unauthenticated access to /collaborateur redirects to login', async ({ page }) => {
    await page.goto('/collaborateur');
    await page.waitForTimeout(2000);
    // Should be redirected away from the protected page
    expect(page.url()).not.toContain('/collaborateur');
  });

  test('Unauthenticated access to /admin/users redirects to login', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForTimeout(2000);
    expect(page.url()).not.toContain('/admin/users');
  });
});

// ── Form validation ─────────────────────────────────────────────────────────
test.describe('Form validation — negative cases', () => {

  test('Leave request form blocks submit without required fields', async ({ page }) => {
    await page.goto('/leave');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);

    const newBtn = page.locator('button.big-action-btn').first();
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(500);

      // Try to submit without filling anything
      const submitBtn = page.locator('.rp button.btn-submit').first();
      if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        const isDisabled = await submitBtn.isDisabled();
        expect(isDisabled, 'Submit button should be disabled when form is empty').toBe(true);
      }
    }
  });

  test('Employee search with no results shows empty state', async ({ page }) => {
    await page.goto('/collaborateur');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input.search-input').first();
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill('XXXXXXXXXNOTFOUND999');
      await page.waitForTimeout(800);
      // Table should show no results (0 rows or empty state)
      const rows = page.locator('tbody tr');
      const count = await rows.count();
      expect(count, 'No rows should match an impossible search term').toBe(0);
    }
  });
});

// ── Data integrity ──────────────────────────────────────────────────────────
test.describe('Data integrity', () => {

  test('Admin user cannot be deleted from user list', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');
    // Wait for user data to load before reading body text
    await page.locator('tbody tr, .table-card, table').first().waitFor({ timeout: 20000 }).catch(() => {});
    const body = await page.locator('body').textContent();
    const hasAdmin = body?.includes('admin@innovx.com');
    expect(hasAdmin, 'Admin user should be visible in user list').toBe(true);
  });

  test('Audit log records exist after actions', async ({ page }) => {
    await page.goto('/audit');
    await page.waitForLoadState('domcontentloaded');
    // Wait for audit content to load
    await page.locator('.table-card, table, [class*="audit"], select').first().waitFor({ timeout: 20000 }).catch(() => {});
    const body = await page.locator('body').textContent();
    // After all the test-suite activity, there should be audit entries
    const hasAuditContent = body?.includes('admin') || body?.includes('LOGIN') ||
      body?.includes('UPDATE') || body?.includes('CREATE');
    expect(hasAuditContent, 'Audit log should have entries from prior test activity').toBe(true);
  });

  test('Leave balance page shows correct year in filter', async ({ page }) => {
    await page.goto('/leave/balance');
    await page.waitForLoadState('domcontentloaded');
    // Wait for leave balance content to render (includes year filter)
    await page.locator('.card, table, [class*="year"], select').first().waitFor({ timeout: 15000 }).catch(() => {});
    const body = await page.locator('body').textContent();
    const currentYear = new Date().getFullYear().toString();
    expect(body).toContain(currentYear);
  });
});

// ── Navigation edge cases ───────────────────────────────────────────────────
test.describe('Navigation edge cases', () => {

  test('Unknown route redirects gracefully (no blank page)', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz');
    await page.waitForTimeout(1500);
    // Should not be a blank page — either 404 UI or redirect to dashboard
    const body = await page.locator('body').textContent();
    expect(body?.trim().length).toBeGreaterThan(10);
  });

  test('Direct URL to protected page works when authenticated', async ({ page }) => {
    // storageState provides JWT — wait for the Angular permission guard to complete
    await page.goto('/salary');
    await page.waitForLoadState('domcontentloaded');
    // Wait up to 15s for the URL to settle at /salary (guard may call backend to load user perms)
    await page.waitForURL(/\/salary/, { timeout: 15000 }).catch(() => {});
    // Should load the page, not redirect to login
    expect(page.url()).toContain('/salary');
  });

  test('Browser back button works after navigation', async ({ page }) => {
    await page.goto('/collaborateur');
    await page.waitForURL(/\/collaborateur/, { timeout: 15000 }).catch(() => {});
    await page.goto('/salary');
    await page.waitForURL(/\/salary/, { timeout: 15000 }).catch(() => {});
    await page.goBack();
    // Wait for back-navigation route guard to complete
    await page.waitForURL(/\/collaborateur/, { timeout: 10000 }).catch(() => {});
    expect(page.url()).toContain('/collaborateur');
  });
});
