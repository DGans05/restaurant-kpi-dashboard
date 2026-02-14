/**
 * Authentication service for NYP store
 * Handles login and 2FA (email verification code) session management
 */

import { Page } from 'playwright';
import * as readline from 'readline';

const NYP_BASE_URL = 'https://store.newyorkpizza.nl';
const LOGIN_TIMEOUT = 30000; // 30 seconds
const TWO_FA_TIMEOUT = 300000; // 5 minutes for user to enter code

/**
 * Prompt user for input in terminal
 * @param question - The question to ask the user
 * @returns User's input
 */
async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Handle 2FA verification code input
 * @param page - Playwright page instance
 * @returns true if 2FA was successful, false if not needed
 */
async function handle2FA(page: Page): Promise<boolean> {
  try {
    // Check if we're on a 2FA/verification page
    // NYP uses TwoFactorAuthenticationCode input field
    const hasVerificationInput = await page.locator(
      'input[name="TwoFactorAuthenticationCode"], input[id="TwoFactorAuthenticationCode"]'
    ).first().isVisible({ timeout: 5000 });

    if (!hasVerificationInput) {
      return false; // No 2FA required
    }

    console.log('\n  📧 2FA verification required!');
    console.log('  ℹ️  An authentication code has been sent to your email.');
    console.log('  ℹ️  Please check your email and enter the code below.');
    console.log('  ℹ️  (You have 5 minutes to enter the code)\n');

    // Prompt user for verification code
    const verificationCode = await promptUser('  Enter verification code: ');

    if (!verificationCode) {
      throw new Error('No verification code provided');
    }

    // Find and fill verification code input (NYP uses TwoFactorAuthenticationCode)
    const codeInput = page.locator(
      'input[name="TwoFactorAuthenticationCode"], input[id="TwoFactorAuthenticationCode"]'
    ).first();

    await codeInput.fill(verificationCode);

    // Find and click submit button (NYP uses input[type="submit"] with value="Verify Code")
    const submitButton = page.locator(
      'input[type="submit"][value="Verify Code"], input[type="submit"]'
    ).first();

    await submitButton.click();

    // Wait for navigation after 2FA
    await page.waitForLoadState('networkidle', { timeout: LOGIN_TIMEOUT });

    console.log('  ✅ 2FA verification successful');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Timeout')) {
      throw new Error('2FA verification timed out - code may have expired');
    }
    throw error;
  }
}

/**
 * Login to NYP store and return authenticated page
 * Handles 2FA email verification if required
 * @param page - Playwright page instance
 * @param username - NYP store username (email)
 * @param password - NYP store password
 * @returns Authenticated page instance
 * @throws Error if login fails
 */
export async function login(page: Page, username: string, password: string): Promise<Page> {
  try {
    // Navigate to NYP store homepage
    await page.goto(NYP_BASE_URL, { waitUntil: 'networkidle', timeout: LOGIN_TIMEOUT });

    // Check if already logged in
    const isAlreadyLoggedIn = await page.locator('a[href*="logout"], button:has-text("Uitloggen")').isVisible().catch(() => false);

    if (isAlreadyLoggedIn) {
      console.log('  ✅ Already authenticated');
      return page;
    }

    // Find and fill login form
    console.log('  🔑 Filling login credentials...');

    // NYP uses UserName (not email) and Password fields
    const usernameInput = page.locator('input[name="UserName"], input[id="UserName"]').first();
    const passwordInput = page.locator('input[name="Password"], input[id="Password"]').first();

    await usernameInput.fill(username);
    await passwordInput.fill(password);

    // Find and click submit button (NYP uses input type="submit" with value="Inloggen")
    const submitButton = page.locator('input[type="submit"][value="Inloggen"], button[type="submit"], input[type="submit"]').first();
    await submitButton.click();

    // Wait for page to load after login
    await page.waitForLoadState('networkidle', { timeout: LOGIN_TIMEOUT });

    // Check if 2FA is required
    await handle2FA(page);

    // Verify successful login by checking for logout button or dashboard elements
    console.log(`  🔍 Current URL: ${page.url()}`);

    const loginSuccess = await page.locator('a[href*="logout"], button:has-text("Uitloggen"), a:has-text("Rapportages"), a[href*="Reporting"]').first().isVisible({ timeout: 10000 }).catch(() => false);

    if (!loginSuccess) {
      // Take screenshot for debugging
      await page.screenshot({ path: 'login-failed.png' }).catch(() => {});
      console.log('  📸 Screenshot saved: login-failed.png');
      console.log(`  ⚠️  Could not find expected elements. URL: ${page.url()}`);

      // Check if we're already on a valid page (sometimes login succeeds but elements are named differently)
      const currentUrl = page.url();
      if (currentUrl.includes('store.newyorkpizza.nl') && !currentUrl.includes('login') && !currentUrl.includes('VerifyLogin')) {
        console.log('  ℹ️  Assuming login successful based on URL');
        console.log('  ✅ Authentication successful');
        return page;
      }

      throw new Error('Login verification failed - could not find expected elements after login');
    }

    console.log('  ✅ Authentication successful');
    return page;
  } catch (error) {
    throw new Error(`NYP login failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if the current page session is still authenticated
 * @param page - Playwright page instance
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Check for elements that only appear when logged in
    const loggedIn = await page.locator('a[href*="logout"], button:has-text("Uitloggen"), a:has-text("Rapportages")').first().isVisible({ timeout: 5000 });
    return loggedIn;
  } catch {
    return false;
  }
}

/**
 * Re-authenticate if session has expired
 * @param page - Playwright page instance
 * @param username - NYP store username
 * @param password - NYP store password
 * @returns Authenticated page instance
 */
export async function reAuthenticate(page: Page, username: string, password: string): Promise<Page> {
  const authenticated = await isAuthenticated(page);

  if (authenticated) {
    return page;
  }

  console.log('  ⚠️  Session expired, re-authenticating...');
  return login(page, username, password);
}
