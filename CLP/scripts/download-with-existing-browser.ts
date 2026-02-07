#!/usr/bin/env node
/**
 * NYP Report Download using existing browser session
 * Connects to an already-open browser where you're logged in
 *
 * Usage:
 * 1. Open Chrome with: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
 * 2. Login to store.newyorkpizza.nl manually
 * 3. Run this script: npm run download-with-browser
 */

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { validateDownloadTime } from '../lib/utils/time-validator';
import { generateMonthRange } from '../lib/utils/date-formatter';
import { NYP_RESTAURANT_CONFIGS } from '../lib/config/nyp-restaurants';
import { NypDownloaderService } from '../lib/services/nyp-downloader-service';
import { getAllReportTypes, getReportTypeConfig } from '../lib/config/report-types';
import { createScriptClient } from '../lib/supabase/script-client';
import { DateRange } from '../lib/types/nyp-types';
import { ReportType } from '../lib/types';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface DownloadStats {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
}

function generateLast6Months(): DateRange[] {
  const ranges: DateRange[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  for (let i = 5; i >= 0; i--) {
    let year = currentYear;
    let month = currentMonth - i;

    if (month <= 0) {
      month += 12;
      year -= 1;
    }

    const { start, end } = generateMonthRange(year, month);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const label = `${monthNames[month - 1]} ${year}`;

    ranges.push({ year, month, start, end, label });
  }

  return ranges;
}

async function getExistingReports(
  restaurantId: string,
  year: number,
  month: number
): Promise<Set<ReportType>> {
  const supabase = createScriptClient();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('reports')
    .select('report_type')
    .eq('restaurant_id', restaurantId)
    .gte('report_period', startDate)
    .lte('report_period', endDate);

  if (error) {
    console.error('  ⚠️  Failed to check existing reports:', error.message);
    return new Set();
  }

  return new Set((data || []).map((r) => r.report_type as ReportType));
}

async function uploadReport(
  restaurantId: string,
  reportType: ReportType,
  filePath: string,
  fileName: string,
  fileSize: number,
  reportPeriod: string
): Promise<boolean> {
  try {
    const supabase = createScriptClient();

    const fileBuffer = await fs.readFile(filePath);
    const file = new File([fileBuffer], fileName, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const [year, month] = reportPeriod.split('-');
    const extension = fileName.split('.').pop();
    const storageFileName = `${reportType}_${reportPeriod}_${Date.now()}.${extension}`;
    const storagePath = `${restaurantId}/${reportType}/${year}/${month}/${storageFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('reports')
      .upload(storagePath, file, { upsert: false });

    if (uploadError) {
      console.error(`    ❌ Upload failed:`, uploadError.message);
      return false;
    }

    const reportConfig = getReportTypeConfig(reportType);
    const { error: dbError } = await supabase.from('reports').insert({
      restaurant_id: restaurantId,
      report_type: reportType,
      report_name: reportConfig.name,
      report_period: reportPeriod,
      file_path: storagePath,
      file_size_bytes: fileSize,
      upload_status: 'uploaded',
    });

    if (dbError) {
      console.error(`    ❌ Database insert failed:`, dbError.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`    ❌ Upload error:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function processRestaurantMonth(
  page: any,
  downloader: NypDownloaderService,
  restaurantId: string,
  dateRange: DateRange,
  stats: DownloadStats
): Promise<void> {
  console.log(`\n📊 Downloading reports for ${dateRange.label}...`);

  const existingReports = await getExistingReports(restaurantId, dateRange.year, dateRange.month);
  const allReports = getAllReportTypes();
  const reportPeriod = `${dateRange.year}-${String(dateRange.month).padStart(2, '0')}-01`;

  let processed = 0;

  for (const reportMeta of allReports) {
    processed++;
    const progress = `(${processed}/${allReports.length})`;

    if (existingReports.has(reportMeta.type)) {
      console.log(`  ⏭️  ${reportMeta.name} - Already exists ${progress}`);
      stats.skipped++;
      continue;
    }

    const downloaded = await downloader.downloadReport(reportMeta, dateRange.start, dateRange.end);

    if (!downloaded) {
      console.log(`  ❌ ${reportMeta.name} - Download failed ${progress}`);
      stats.failed++;
      continue;
    }

    const uploaded = await uploadReport(
      restaurantId,
      reportMeta.type,
      downloaded.filePath,
      downloaded.fileName,
      downloaded.fileSize,
      reportPeriod
    );

    if (uploaded) {
      console.log(`  ✅ ${reportMeta.name} ${progress}`);
      stats.successful++;
    } else {
      console.log(`  ❌ ${reportMeta.name} - Upload failed ${progress}`);
      stats.failed++;
    }

    try {
      await fs.unlink(downloaded.filePath);
    } catch {
      // Ignore cleanup errors
    }
  }

  console.log(`\n  📈 Summary for ${dateRange.label}:`);
  console.log(`     Total: ${stats.total} | Successful: ${stats.successful} | Skipped: ${stats.skipped} | Failed: ${stats.failed}`);
}

async function main() {
  console.log('🚀 NYP Report Download (Using Existing Browser)\n');

  // Validate time
  try {
    validateDownloadTime();
    console.log('⏰ Time check: ✅ OK\n');
  } catch (error) {
    console.error('❌', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  // Generate date ranges
  const dateRanges = generateLast6Months();
  console.log(`📅 Downloading reports for 6 months (${dateRanges[0].label} to ${dateRanges[dateRanges.length - 1].label})\n`);

  // Setup temp directory
  const sessionId = uuidv4();
  const tempDir = path.join('/tmp', 'nyp-reports', sessionId);
  await fs.mkdir(tempDir, { recursive: true });
  console.log(`📁 Temporary directory: ${tempDir}\n`);

  try {
    // Connect to existing browser
    console.log('🔗 Connecting to existing browser (port 9222)...');
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('✅ Connected to existing browser\n');

    const contexts = browser.contexts();
    if (contexts.length === 0) {
      throw new Error('No browser contexts found. Please open a browser window first.');
    }

    const context = contexts[0];
    const pages = context.pages();

    if (pages.length === 0) {
      throw new Error('No pages found. Please open store.newyorkpizza.nl in your browser.');
    }

    // Find or create page with NYP store
    let page = pages.find(p => p.url().includes('newyorkpizza.nl'));

    if (!page) {
      console.log('📄 Opening new tab for NYP store...');
      page = await context.newPage();
      await page.goto('https://store.newyorkpizza.nl');
    }

    console.log(`📍 Using page: ${page.url()}\n`);

    const globalStats: DownloadStats = {
      total: getAllReportTypes().length * dateRanges.length,
      successful: 0,
      skipped: 0,
      failed: 0,
    };

    // Process Rosmalen restaurant
    const restaurant = NYP_RESTAURANT_CONFIGS[0];
    console.log(`${'='.repeat(60)}`);
    console.log(`🏪 Processing restaurant: ${restaurant.restaurantId.toUpperCase()}`);
    console.log('='.repeat(60));

    const downloader = new NypDownloaderService(page, tempDir);

    for (const dateRange of dateRanges) {
      await processRestaurantMonth(page, downloader, restaurant.restaurantId, dateRange, globalStats);
    }

    console.log(`\n\n${'='.repeat(60)}`);
    console.log('✨ All downloads complete!');
    console.log('='.repeat(60));
    console.log(`📊 Final Statistics:`);
    console.log(`   Total reports: ${globalStats.total}`);
    console.log(`   ✅ Successful: ${globalStats.successful}`);
    console.log(`   ⏭️  Skipped: ${globalStats.skipped}`);
    console.log(`   ❌ Failed: ${globalStats.failed}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log(`🧹 Temporary files cleaned up\n`);
    } catch {
      console.log(`⚠️  Could not clean up temporary directory: ${tempDir}\n`);
    }
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
