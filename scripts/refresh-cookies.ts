#!/usr/bin/env node
/**
 * Refresh auth.json cookies by opening a browser for manual login
 *
 * 1. Opens Chromium to store.newyorkpizza.nl
 * 2. You login manually (including 2FA)
 * 3. Once logged in, press Enter in this terminal
 * 4. Cookies are saved to auth.json
 *
 * Usage: npx tsx scripts/refresh-cookies.ts
 */

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const AUTH_JSON_PATH = path.resolve(__dirname, '..', 'auth.json');
const NYP_URL = 'https://store.newyorkpizza.nl';

async function waitForEnter(message: string): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(message, () => {
      rl.close();
      resolve();
    });
  });
}

async function main() {
  console.log('Cookie Refresh Tool\n');
  console.log('Opening browser to NYP store...');
  console.log('Please login manually (including 2FA if needed).\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(NYP_URL);

  await waitForEnter('Press ENTER here after you have logged in successfully...\n');

  // Verify we're logged in (not on login page)
  const currentUrl = page.url();
  if (currentUrl.includes('/Account/Login') || currentUrl.includes('/Account/VerifyLogin')) {
    console.log(`Warning: URL looks like a login page: ${currentUrl}`);
    console.log('Saving cookies anyway...\n');
  }

  // Save cookies
  const storageState = await context.storageState();
  await fs.writeFile(AUTH_JSON_PATH, JSON.stringify(storageState, null, 2));

  const cookieCount = storageState.cookies.length;
  const nypCookies = storageState.cookies.filter(c => c.domain.includes('newyorkpizza.nl'));

  console.log(`Saved ${cookieCount} cookies (${nypCookies.length} NYP) to ${AUTH_JSON_PATH}`);

  // Check for the critical auth cookie
  const hasAuthCookie = nypCookies.some(c => c.name === '.AspNet.ApplicationCookie-S4D.Web.Store');
  if (hasAuthCookie) {
    console.log('Auth cookie found - ready to download reports!\n');
    console.log('Run: npx tsx scripts/download-nyp-reports.ts');
  } else {
    console.log('Warning: Main auth cookie not found. Login may not have completed.\n');
  }

  await browser.close();
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
