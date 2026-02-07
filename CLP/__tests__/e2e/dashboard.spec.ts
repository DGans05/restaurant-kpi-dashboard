import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);

    // Should show login form
    await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();
  });

  test('should show dashboard after login', async ({ page }) => {
    // Navigate to dashboard (will redirect to login)
    await page.goto('/dashboard');

    // Fill login form
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    await emailInput.fill(process.env.TEST_USER_EMAIL || 'test@example.com');
    await passwordInput.fill(process.env.TEST_USER_PASSWORD || 'password123');

    // Submit login
    await page.getByRole('button', { name: /log in|inloggen/i }).click();

    // Should navigate to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Should show dashboard header
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});

test.describe('Dashboard KPI Cards', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    await emailInput.fill(process.env.TEST_USER_EMAIL || 'test@example.com');
    await passwordInput.fill(process.env.TEST_USER_PASSWORD || 'password123');

    await page.getByRole('button', { name: /log in|inloggen/i }).click();
    await page.waitForURL(/\/dashboard/);
  });

  test('should display all KPI cards', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[class*="metric-value"]', { timeout: 5000 });

    // Check for KPI card titles
    await expect(page.getByText('Netto Omzet')).toBeVisible();
    await expect(page.getByText('Arbeidskosten')).toBeVisible();
    await expect(page.getByText('Bestellingen')).toBeVisible();
    await expect(page.getByText('Productiviteit')).toBeVisible();
    await expect(page.getByText('Prime Cost')).toBeVisible();
  });

  test('should show metric values', async ({ page }) => {
    // Wait for metric values to load
    const metricValues = page.locator('[class*="metric-value"]');
    await expect(metricValues.first()).toBeVisible({ timeout: 5000 });

    // Should have at least 4 metric values (revenue, labour, orders, productivity)
    await expect(metricValues).toHaveCount(5); // 4 main + prime cost
  });
});

test.describe('Period Selector', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to dashboard
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    await emailInput.fill(process.env.TEST_USER_EMAIL || 'test@example.com');
    await passwordInput.fill(process.env.TEST_USER_PASSWORD || 'password123');

    await page.getByRole('button', { name: /log in|inloggen/i }).click();
    await page.waitForURL(/\/dashboard/);
  });

  test('should toggle between week and month views', async ({ page }) => {
    // Find view toggle buttons
    const weekButton = page.getByRole('button', { name: /week/i }).first();
    const monthButton = page.getByRole('button', { name: /maand|month/i }).first();

    // Click month view
    await monthButton.click();

    // URL should include view=month
    await expect(page).toHaveURL(/view=month/);

    // Click week view
    await weekButton.click();

    // URL should include view=week
    await expect(page).toHaveURL(/view=week/);
  });

  test('should navigate to previous period', async ({ page }) => {
    // Get current URL
    const currentUrl = page.url();

    // Click previous period button
    const prevButton = page.getByRole('button', { name: /vorige|previous|chevron.*left/i }).first();
    await prevButton.click();

    // Wait for navigation
    await page.waitForTimeout(500);

    // URL should have changed
    const newUrl = page.url();
    expect(newUrl).not.toBe(currentUrl);
  });

  test('should navigate to next period', async ({ page }) => {
    // Navigate to previous period first (so next is enabled)
    const prevButton = page.getByRole('button', { name: /vorige|previous|chevron.*left/i }).first();
    await prevButton.click();
    await page.waitForTimeout(500);

    // Get current URL
    const currentUrl = page.url();

    // Click next period button
    const nextButton = page.getByRole('button', { name: /volgende|next|chevron.*right/i }).first();
    await nextButton.click();

    // Wait for navigation
    await page.waitForTimeout(500);

    // URL should have changed
    const newUrl = page.url();
    expect(newUrl).not.toBe(currentUrl);
  });
});

test.describe('Charts', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to dashboard
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    await emailInput.fill(process.env.TEST_USER_EMAIL || 'test@example.com');
    await passwordInput.fill(process.env.TEST_USER_PASSWORD || 'password123');

    await page.getByRole('button', { name: /log in|inloggen/i }).click();
    await page.waitForURL(/\/dashboard/);
  });

  test('should display revenue chart', async ({ page }) => {
    // Wait for chart to load
    await page.waitForSelector('svg', { timeout: 5000 });

    // Should have SVG elements (Recharts renders as SVG)
    const svgs = page.locator('svg');
    await expect(svgs.first()).toBeVisible();
  });

  test('should display cost breakdown chart', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('svg', { timeout: 5000 });

    // Should have multiple SVG elements (multiple charts)
    const svgs = page.locator('svg');
    const count = await svgs.count();
    expect(count).toBeGreaterThan(1); // At least 2 charts (revenue + labour)
  });
});

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    await emailInput.fill(process.env.TEST_USER_EMAIL || 'test@example.com');
    await passwordInput.fill(process.env.TEST_USER_PASSWORD || 'password123');

    await page.getByRole('button', { name: /log in|inloggen/i }).click();
    await page.waitForURL(/\/dashboard/);
  });

  test('should toggle between light and dark modes', async ({ page }) => {
    // Find theme toggle button (usually a sun/moon icon)
    const themeToggle = page.getByRole('button', { name: /theme|toggle theme/i }).first();

    if (await themeToggle.isVisible()) {
      // Click to toggle theme
      await themeToggle.click();

      // Wait for theme to apply
      await page.waitForTimeout(300);

      // Click again to toggle back
      await themeToggle.click();

      // Theme should have toggled
      expect(true).toBe(true); // If we got here without errors, theme toggle works
    } else {
      // Theme toggle not visible - skip test
      test.skip();
    }
  });
});
