import { Page, expect } from '@playwright/test';

export const BASE = 'http://localhost:4200';
export const ADMIN = { email: 'admin@innovx.com', password: 'Admin@123' };

/**
 * Smart login — with storageState set globally, most tests are already
 * authenticated. This helper navigates to '/' and:
 *  - If the app redirects straight to /dashboard → already logged in, done.
 *  - If the login form appears → performs full login as fallback.
 */
export async function login(page: Page) {
  await page.goto('/');

  // Check whether the login form is visible (unauthenticated) or not
  const loginVisible = await page
    .locator('input.form-input[type="email"]')
    .isVisible({ timeout: 3000 })
    .catch(() => false);

  if (loginVisible) {
    // Full login flow (fallback if storageState expired)
    await page.locator('input.form-input[type="email"]').fill(ADMIN.email);
    await page.locator('input.form-input[type="password"]').fill(ADMIN.password);
    await page.locator('button.btn-signin').click();
  }

  // Wait for dashboard redirect (fast if already authed, normal if just logged in)
  await page.waitForURL(/\/dashboard/, { timeout: 35000 });
}

export async function navigateTo(page: Page, route: string) {
  await page.goto(`${BASE}/${route}`);
  await page.waitForLoadState('domcontentloaded');
}

export async function expectNoConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

export async function waitForTable(page: Page) {
  await page.waitForSelector('table, .table-card, tbody', { timeout: 10000 }).catch(() => {});
}

export async function dismissConfirmDialog(page: Page, confirm = false) {
  // Try styled confirm dialog first
  const btn = page.locator(`button._cf-btn-${confirm ? 'confirm' : 'cancel'}`);
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn.click();
    return;
  }
  // Fallback native dialog
  page.once('dialog', d => confirm ? d.accept() : d.dismiss());
}
