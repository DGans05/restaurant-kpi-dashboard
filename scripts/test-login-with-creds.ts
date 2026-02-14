#!/usr/bin/env node
/**
 * Test script to debug login process with real credentials
 * Opens visible browser to see what happens
 */

import { chromium } from 'playwright';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  console.log('🔍 Testing NYP Login\n');

  const username = process.env.NYP_STORE_USERNAME_ROSMALEN;
  const password = process.env.NYP_STORE_PASSWORD_ROSMALEN;

  if (!username || !password) {
    console.error('❌ Missing credentials in .env.local');
    process.exit(1);
  }

  console.log(`📧 Username: ${username}`);
  console.log(`🔑 Password: ${'*'.repeat(password.length)}\n`);

  const browser = await chromium.launch({
    headless: false,  // Visible browser
    slowMo: 500       // Slow down actions to see them
  });

  const page = await browser.newPage();

  try {
    console.log('📍 Navigating to NYP store...');
    await page.goto('https://store.newyorkpizza.nl', { waitUntil: 'networkidle' });

    console.log('📸 Taking screenshot: before-login.png');
    await page.screenshot({ path: 'before-login.png', fullPage: true });

    console.log('🔑 Filling username...');
    const usernameInput = page.locator('input[name="UserName"], input[id="UserName"]').first();
    await usernameInput.fill(username);

    console.log('🔑 Filling password...');
    const passwordInput = page.locator('input[name="Password"], input[id="Password"]').first();
    await passwordInput.fill(password);

    console.log('📸 Taking screenshot: before-submit.png');
    await page.screenshot({ path: 'before-submit.png', fullPage: true });

    console.log('🖱️  Clicking submit...');
    const submitButton = page.locator('input[type="submit"][value="Inloggen"]').first();
    await submitButton.click();

    console.log('⏳ Waiting for page to load...');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    console.log('📸 Taking screenshot: after-submit.png');
    await page.screenshot({ path: 'after-submit.png', fullPage: true });

    console.log(`\n📍 Current URL: ${page.url()}`);
    console.log(`📄 Page title: ${await page.title()}\n`);

    // Check for various elements
    console.log('🔎 Looking for elements on page:\n');

    const checks = [
      { name: 'Logout button', selector: 'a[href*="logout"], button:has-text("Uitloggen")' },
      { name: 'Rapportages link', selector: 'a:has-text("Rapportages"), a[href*="Reporting"]' },
      { name: 'Error message', selector: '.field-validation-error, .alert-danger, .error' },
      { name: '2FA code input', selector: 'input[name*="code"], input[name*="verification"]' },
    ];

    for (const check of checks) {
      const count = await page.locator(check.selector).count();
      if (count > 0) {
        console.log(`  ✅ Found: ${check.name} (${count} element(s))`);
        const text = await page.locator(check.selector).first().textContent().catch(() => '');
        if (text) console.log(`     Text: "${text.trim().substring(0, 100)}"`);
      } else {
        console.log(`  ❌ Not found: ${check.name}`);
      }
    }

    console.log('\n⏸️  Browser will stay open for 60 seconds for inspection...');
    console.log('   Check the page and press Ctrl+C when done\n');

    await page.waitForTimeout(60000);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    console.log('\n📸 Taking error screenshot: error.png');
    await page.screenshot({ path: 'error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('✅ Browser closed');
  }
}

main().catch(console.error);
