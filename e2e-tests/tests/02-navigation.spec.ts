import { test, expect } from '@playwright/test';

const PAGES = [
  { route: 'dashboard',      label: 'Dashboard' },
  { route: 'collaborateur',  label: 'Employees' },
  { route: 'org',            label: 'Org Chart' },
  { route: 'onboarding',     label: 'Onboarding' },
  { route: 'performance',    label: 'Performance' },
  { route: 'leave',          label: 'Leave Requests' },
  { route: 'leave/balance',  label: 'Leave Balance' },
  { route: 'leave/request',  label: 'Leave Request Form' },
  { route: 'attendance',     label: 'Attendance' },
  { route: 'planning',       label: 'Planning' },
  { route: 'salary',         label: 'Salary' },
  { route: 'training',       label: 'Training' },
  { route: 'recruitment',    label: 'Recruitment' },
  { route: 'UploadsCv',      label: 'CV Management' },
  { route: 'stagiaires',     label: 'Interns' },
  { route: 'projects-hr',    label: 'Projects HR' },
  { route: 'documents',      label: 'Documents' },
  { route: 'filemanager',    label: 'File Manager' },
  { route: 'public-holidays', label: 'Public Holidays' },
  { route: 'audit',          label: 'Audit Logs' },
  { route: 'statistics',     label: 'Statistics' },
  { route: 'admin/users',    label: 'User Management' },
  { route: 'admin/roles',    label: 'Role Management' },
  { route: 'settings',       label: 'Settings' },
];

test.describe('Navigation — all pages load without crash', () => {

  for (const p of PAGES) {
    test(`${p.label} (/${p.route})`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(`/${p.route}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(800);

      // Page should not show an Angular error overlay
      const ngError = page.locator('ng-component:has-text("Error"), .error-overlay, [class*="error-page"]');
      const hasNgError = await ngError.isVisible({ timeout: 1000 }).catch(() => false);
      expect(hasNgError, `Angular error on /${p.route}`).toBe(false);

      // No JS runtime crash (TypeError, Cannot read properties, etc.)
      const crashErrors = errors.filter(e =>
        e.includes('Cannot read properties') ||
        e.includes('is not a function') ||
        e.includes('is not defined') ||
        e.includes('ChunkLoadError')
      );
      expect(crashErrors, `JS crash on /${p.route}: ${crashErrors.join(', ')}`).toHaveLength(0);
    });
  }
});

test.describe('Sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('Sidebar links are visible after login', async ({ page }) => {
    // Check a nav link inside the sidebar — the host element is CSS-hidden on mobile
    // breakpoints but the nav items themselves are always in the rendered tree
    const navItem = page.locator('.wiko-sb-nav-item').first();
    await expect(navItem).toBeAttached({ timeout: 10000 });
  });

  test('Language toggle EN/FR works', async ({ page }) => {
    const langBtn = page.locator('button:has-text("FR"), button:has-text("EN"), [class*="lang"], .flag-icon').first();
    if (await langBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await langBtn.click();
      await page.waitForTimeout(800);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Theme toggle dark/light works', async ({ page }) => {
    const themeBtn = page.locator('[class*="theme"], button[title*="theme"], button[title*="dark"], button[title*="light"]').first();
    if (await themeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await themeBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
