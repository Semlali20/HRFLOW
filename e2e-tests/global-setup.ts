import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup — runs ONCE before the entire test suite.
 *
 * 1. Logs in as admin and saves auth state to auth.json.
 *    All tests start pre-authenticated via storageState — no repeated login.
 *
 * 2. Warms up the Spring Boot backend by visiting the major pages.
 *    Hibernate initialises its entity metadata and JIT compiles the hot
 *    query paths on the FIRST call to each endpoint.  Without this warmup,
 *    the first test that actually waits for API data in a given spec file
 *    would time-out (>10 s) because the JVM is cold.  A single 60-second
 *    warmup here pays for itself across the entire 127-test suite.
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL ?? 'http://localhost:4200';
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // ── 1. Login ────────────────────────────────────────────────────────────
  await page.goto(baseURL + '/');
  await page.waitForSelector('input.form-input[type="email"]', { timeout: 20000 });
  await page.locator('input.form-input[type="email"]').fill('admin@innovx.com');
  await page.locator('input.form-input[type="password"]').fill('Admin@123');
  await page.locator('button.btn-signin').click();
  await page.waitForURL(/\/dashboard/, { timeout: 35000 });
  console.log('\n✅ Global setup: logged in — warming up backend API endpoints…');

  // ── 2. Backend warmup ───────────────────────────────────────────────────
  // Visit the pages whose API endpoints are slowest on first call.
  // We wait generously so Hibernate/JIT has time to fully initialise each
  // query path before the real tests start using short timeouts.
  const warmupPages: Array<{ path: string; waitMs: number }> = [
    { path: '/collaborateur',  waitMs: 15000 }, // employees list — heaviest first call
    { path: '/org',            waitMs: 8000  }, // departments
    { path: '/onboarding',     waitMs: 8000  }, // onboarding processes
    { path: '/performance',    waitMs: 8000  }, // performance reviews
    { path: '/leave',          waitMs: 8000  }, // leave requests
    { path: '/leave/balance',  waitMs: 6000  }, // leave balance + types
    { path: '/salary',         waitMs: 6000  }, // salary
    { path: '/training',       waitMs: 6000  }, // training
    { path: '/recruitment',    waitMs: 6000  }, // recruitment
    { path: '/audit',          waitMs: 6000  }, // audit log
    { path: '/admin/users',    waitMs: 6000  }, // user management
    { path: '/admin/roles',    waitMs: 6000  }, // roles
    { path: '/statistics',     waitMs: 8000  }, // statistics charts
    { path: '/projects-hr',    waitMs: 6000  }, // projects
  ];

  for (const { path, waitMs } of warmupPages) {
    try {
      await page.goto(baseURL + path, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(waitMs);
      console.log(`   ✓ warmed up ${path}`);
    } catch {
      console.log(`   ⚠ warmup skipped for ${path} (timeout)`);
    }
  }

  // ── 3. Save auth state ──────────────────────────────────────────────────
  // The login form uses rememberMe=false → auth is in sessionStorage.
  // Playwright's storageState only captures localStorage, so we copy
  // authUser into localStorage before saving — tests will then start
  // pre-authenticated via the injected localStorage key.
  await page.evaluate(() => {
    const key = 'authUser';
    const authData = sessionStorage.getItem(key);
    if (authData) {
      localStorage.setItem(key, authData);
    }
  });
  await page.context().storageState({ path: 'auth.json' });
  await browser.close();
  console.log('✅ Global setup complete — auth state saved to auth.json\n');
}

export default globalSetup;
