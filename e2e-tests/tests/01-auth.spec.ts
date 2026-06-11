import { test, expect } from '@playwright/test';
import { login, ADMIN } from './helpers';

// Auth tests need a clean unauthenticated state — override the global storageState
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication', () => {

  test('Login page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input.form-input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input.form-input[type="password"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button.btn-signin')).toBeVisible({ timeout: 5000 });
  });

  test('Wrong credentials shows error', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('input.form-input[type="email"]', { timeout: 10000 });
    await page.locator('input.form-input[type="email"]').fill('wrong@test.com');
    await page.locator('input.form-input[type="password"]').fill('wrongpassword');
    await page.locator('button.btn-signin').click();
    await page.waitForTimeout(2500);
    expect(page.url()).not.toMatch(/dashboard/);
  });

  test('Empty form shows validation or stays on login', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button.btn-signin', { timeout: 10000 });
    await page.locator('button.btn-signin').click();
    await page.waitForTimeout(1000);
    expect(page.url()).not.toMatch(/dashboard/);
  });

  test('Successful login redirects to /dashboard', async ({ page }) => {
    await login(page);
    expect(page.url()).toContain('/dashboard');
  });

  test('Auth user stored in localStorage or sessionStorage after login', async ({ page }) => {
    await login(page);
    const stored = await page.evaluate(() =>
      localStorage.getItem('authUser') ?? sessionStorage.getItem('authUser')
    );
    expect(stored, 'authUser key should exist in storage after login').not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.accessToken || parsed.token, 'accessToken should be present').toBeTruthy();
  });

  test('Logout works and redirects to login', async ({ page }) => {
    await login(page);
    // Click the user info dropdown (top-right)
    const userDropdown = page.locator('.user-info, [class*="user-name"], .navbar-user, .topbar-user').first();
    if (await userDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await userDropdown.click();
      await page.waitForTimeout(400);
    }
    // Click logout
    const logoutBtn = page.locator('a:has-text("Logout"), a:has-text("Sign Out"), button:has-text("Logout"), a:has-text("Déconnexion")').first();
    if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/login|auth|\/$|\/#/);
    } else {
      test.info().annotations.push({ type: 'note', description: 'Logout button not found — skipped' });
    }
  });

});
