#!/usr/bin/env tsx
/**
 * Capture NYP Session Cookies
 *
 * This script:
 * 1. Opens NYP store in a browser
 * 2. Logs in with provided credentials
 * 3. Captures session cookies
 * 4. Stores them in the nyp_sessions table in Supabase
 *
 * Usage: tsx scripts/capture-nyp-cookies.ts
 */

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const NYP_LOGIN_URL = 'https://store.newyorkpizza.nl';

async function main() {
  console.log('🍪 NYP Cookie Capture Script\n');

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const username = process.env.NYP_STORE_USERNAME_ROSMALEN;
  const password = process.env.NYP_STORE_PASSWORD_ROSMALEN;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (!username || !password) {
    console.error('❌ Missing NYP credentials');
    console.error('   Set NYP_STORE_USERNAME_ROSMALEN and NYP_STORE_PASSWORD_ROSMALEN');
    process.exit(1);
  }

  // Create Supabase client with service role (bypasses RLS)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('🌐 Launching browser...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📍 Navigating to NYP store...');
    await page.goto(NYP_LOGIN_URL, { waitUntil: 'networkidle' });

    console.log('🔐 Attempting login...');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for visible text inputs only
    const emailInput = page.locator('input[type="text"]:visible, input[type="email"]:visible').first();
    const passwordInput = page.locator('input[type="password"]:visible').first();

    // Wait for both to be visible
    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    await passwordInput.waitFor({ state: 'visible', timeout: 5000 });

    // Fill in credentials
    await emailInput.fill(username);
    await passwordInput.fill(password);

    // Find and click submit button (green "Inloggen" button)
    const submitButton = page.locator('button:has-text("Inloggen")').first();

    console.log('📤 Submitting login form...');
    // Click and don't wait for navigation (2FA causes long waits)
    await submitButton.click({ timeout: 5000 }).catch(() => {
      console.log('   Click initiated (navigation pending)...');
    });

    // Give time for navigation to start
    await page.waitForTimeout(5000);

    // Check URL after login
    let url = page.url();
    console.log(`📍 Current URL: ${url}`);

    // Handle 2FA verification if present
    if (url.includes('VerifyLogin') || url.includes('verify')) {
      console.log('🔐 2FA detected! Waiting for manual verification...');
      console.log('   Please complete the 2FA verification in the browser');
      console.log('   (Check your email/phone for the code)');

      // Wait for user to complete 2FA (max 2 minutes)
      console.log('   ⏳ Waiting up to 2 minutes for verification...');

      try {
        // Wait for URL to change away from verify page
        await page.waitForURL((url) => !url.href.includes('Verify'), { timeout: 120000 });
        url = page.url();
        console.log(`   ✅ Verification complete! New URL: ${url}`);
      } catch (error) {
        console.error('❌ 2FA verification timeout');
        console.log('📸 Taking screenshot...');
        await page.screenshot({ path: 'nyp-2fa-timeout.png', fullPage: true });
        console.log('   Saved: nyp-2fa-timeout.png');
        process.exit(1);
      }
    }

    // Check if we're still on login page (failed login)
    if (url.includes('/login') || url.includes('/signin')) {
      console.error('❌ Login may have failed (still on login page)');
      console.log('📸 Taking screenshot...');
      await page.screenshot({ path: 'nyp-login-failed.png', fullPage: true });
      console.log('   Saved: nyp-login-failed.png');

      const errorText = await page.textContent('body');
      if (errorText?.toLowerCase().includes('error') || errorText?.toLowerCase().includes('incorrect')) {
        console.error('   Possible error message detected on page');
      }

      process.exit(1);
    }

    console.log('✅ Login successful!');

    // Capture cookies
    console.log('🍪 Capturing cookies...');
    const cookies = await context.cookies();

    if (cookies.length === 0) {
      console.error('❌ No cookies found');
      process.exit(1);
    }

    console.log(`   Found ${cookies.length} cookies`);

    // Convert cookies to JSON object format
    const cookiesJson: Record<string, string> = {};
    for (const cookie of cookies) {
      cookiesJson[cookie.name] = cookie.value;
    }

    // Store in database
    console.log('💾 Storing cookies in database...');

    const { error: upsertError } = await supabase
      .from('nyp_sessions')
      .upsert({
        restaurant_id: 'rosmalen',
        cookies_json: JSON.stringify(cookiesJson),
        last_validated: new Date().toISOString(),
        is_active: true,
      }, {
        onConflict: 'restaurant_id',
      });

    if (upsertError) {
      console.error('❌ Failed to store cookies:', upsertError.message);
      process.exit(1);
    }

    console.log('✅ Cookies stored successfully!');

    // Verify
    const { data: session, error: fetchError } = await supabase
      .from('nyp_sessions')
      .select('*')
      .eq('restaurant_id', 'rosmalen')
      .single();

    if (fetchError) {
      console.error('⚠️  Could not verify stored session:', fetchError.message);
    } else {
      console.log('\n📊 Session Details:');
      console.log(`   Restaurant ID: ${session.restaurant_id}`);
      console.log(`   Last Validated: ${session.last_validated}`);
      console.log(`   Active: ${session.is_active}`);
      console.log(`   Cookie Count: ${Object.keys(JSON.parse(session.cookies_json)).length}`);
    }

    console.log('\n✨ Done! Cookies are ready for automated downloads.');
    console.log('   Next: Test the cron job with:');
    console.log('   curl -X POST https://nypkpi.com/api/cron/download-reports \\');
    console.log('     -H "Authorization: Bearer $CRON_SECRET"');

    // Keep browser open for 5 seconds so you can verify
    console.log('\n⏸️  Browser will stay open for 5 seconds...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    console.log('📸 Taking error screenshot...');
    await page.screenshot({ path: 'nyp-error.png', fullPage: true });
    console.log('   Saved: nyp-error.png');
    process.exit(1);
  } finally {
    await browser.close();
    console.log('\n✅ Browser closed');
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
