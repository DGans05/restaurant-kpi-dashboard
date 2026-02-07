#!/usr/bin/env node
/**
 * Test script to inspect NYP login page structure
 * Helps identify correct selectors for authentication
 */

import { chromium } from 'playwright';

async function main() {
  console.log('🔍 NYP Login Page Inspector\n');

  const browser = await chromium.launch({ headless: false }); // visible browser
  const page = await browser.newPage();

  try {
    console.log('📍 Navigating to NYP store...');
    await page.goto('https://store.newyorkpizza.nl', { waitUntil: 'networkidle' });

    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'nyp-login-page.png', fullPage: true });
    console.log('   Saved: nyp-login-page.png\n');

    console.log('🔎 Looking for login form elements...\n');

    // Try to find email/username inputs
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[name="username"]',
      'input[id*="email"]',
      'input[id*="username"]',
      'input[placeholder*="email"]',
      'input[placeholder*="Email"]',
    ];

    console.log('Email/Username input fields:');
    for (const selector of emailSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        const element = page.locator(selector).first();
        const name = await element.getAttribute('name').catch(() => 'N/A');
        const id = await element.getAttribute('id').catch(() => 'N/A');
        const placeholder = await element.getAttribute('placeholder').catch(() => 'N/A');
        console.log(`  ✅ Found: ${selector}`);
        console.log(`     name="${name}", id="${id}", placeholder="${placeholder}"`);
      }
    }

    // Try to find password inputs
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[id*="password"]',
    ];

    console.log('\nPassword input fields:');
    for (const selector of passwordSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        const element = page.locator(selector).first();
        const name = await element.getAttribute('name').catch(() => 'N/A');
        const id = await element.getAttribute('id').catch(() => 'N/A');
        console.log(`  ✅ Found: ${selector}`);
        console.log(`     name="${name}", id="${id}"`);
      }
    }

    // Try to find submit buttons
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Log")',
      'button:has-text("Sign")',
      'button:has-text("Inloggen")',
    ];

    console.log('\nSubmit buttons:');
    for (const selector of submitSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        const element = page.locator(selector).first();
        const text = await element.textContent().catch(() => 'N/A');
        const type = await element.getAttribute('type').catch(() => 'N/A');
        console.log(`  ✅ Found: ${selector}`);
        console.log(`     text="${text}", type="${type}"`);
      }
    }

    console.log('\n📋 Page HTML saved to: nyp-login-page.html');
    const html = await page.content();
    await require('fs').promises.writeFile('nyp-login-page.html', html);

    console.log('\n⏸️  Browser will stay open for 30 seconds for manual inspection...');
    console.log('   Press Ctrl+C to close early\n');

    await page.waitForTimeout(30000);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
    console.log('✅ Browser closed');
  }
}

main().catch(console.error);
