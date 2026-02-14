#!/usr/bin/env node
/**
 * Capture the 2FA verification page HTML
 */

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  console.log('🔍 Capturing 2FA Page\n');

  const username = process.env.NYP_STORE_USERNAME_ROSMALEN!;
  const password = process.env.NYP_STORE_PASSWORD_ROSMALEN!;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://store.newyorkpizza.nl', { waitUntil: 'networkidle' });

    // Fill and submit login
    await page.locator('input[name="UserName"]').fill(username);
    await page.locator('input[name="Password"]').fill(password);
    await page.locator('input[type="submit"]').click();

    // Wait for navigation
    await page.waitForLoadState('networkidle');

    console.log(`Current URL: ${page.url()}\n`);

    // Save HTML
    const html = await page.content();
    await fs.writeFile('2fa-page.html', html);
    console.log('✅ Saved: 2fa-page.html\n');

    // Look for all input fields
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input fields:\n`);

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type').catch(() => 'unknown');
      const name = await input.getAttribute('name').catch(() => 'N/A');
      const id = await input.getAttribute('id').catch(() => 'N/A');
      const placeholder = await input.getAttribute('placeholder').catch(() => 'N/A');
      const className = await input.getAttribute('class').catch(() => 'N/A');

      console.log(`Input ${i + 1}:`);
      console.log(`  type="${type}"`);
      console.log(`  name="${name}"`);
      console.log(`  id="${id}"`);
      console.log(`  placeholder="${placeholder}"`);
      console.log(`  class="${className}"\n`);
    }

    // Look for buttons
    const buttons = await page.locator('button, input[type="submit"]').all();
    console.log(`Found ${buttons.length} buttons:\n`);

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent().catch(() => '');
      const value = await button.getAttribute('value').catch(() => 'N/A');
      const type = await button.getAttribute('type').catch(() => 'N/A');

      console.log(`Button ${i + 1}:`);
      console.log(`  text="${text.trim()}"`);
      console.log(`  value="${value}"`);
      console.log(`  type="${type}"\n`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

main();
