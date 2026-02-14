#!/usr/bin/env node
import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  const context = contexts[0];
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('newyorkpizza.nl')) || pages[0];

  console.log(`Current URL: ${page.url()}\n`);

  // Navigate to a report page
  await page.goto('https://store.newyorkpizza.nl/Reporting/Generate/Operationele');
  await page.waitForLoadState('networkidle');

  console.log('Looking for buttons and inputs...\n');

  // Find all buttons
  const buttons = await page.locator('button, input[type="submit"], input[type="button"]').all();
  console.log(`Found ${buttons.length} buttons:\n`);

  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const tagName = await button.evaluate(el => el.tagName);
    const type = await button.getAttribute('type').catch(() => 'N/A');
    const text = await button.textContent().catch(() => '');
    const value = await button.getAttribute('value').catch(() => 'N/A');
    const className = await button.getAttribute('class').catch(() => 'N/A');

    console.log(`Button ${i + 1}:`);
    console.log(`  Tag: ${tagName}`);
    console.log(`  Type: ${type}`);
    console.log(`  Text: "${text.trim()}"`);
    console.log(`  Value: "${value}"`);
    console.log(`  Class: "${className}"\n`);
  }

  // Take screenshot
  await page.screenshot({ path: 'report-page-debug.png', fullPage: true });
  console.log('Screenshot saved: report-page-debug.png');
}

main();
