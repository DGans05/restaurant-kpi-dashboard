#!/usr/bin/env node
/**
 * NYP Report Download Automation (HTTP API version)
 *
 * Downloads all 30+ report types from NYP store for the last 6 months
 * and uploads them to Supabase Storage.
 *
 * Auth: Uses cookies from auth.json (exported from DevTools).
 * No browser/Playwright required.
 *
 * Usage: npx tsx scripts/download-nyp-reports.ts
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { validateDownloadTime } from '../lib/utils/time-validator';
import { generateMonthRange } from '../lib/utils/date-formatter';
import { loadCookiesFromFile } from '../lib/utils/cookie-loader';
import { NYPApiClient, SessionExpiredError } from '../lib/services/nyp-api-client';
import { getAllReportTypes, getReportTypeConfig } from '../lib/config/report-types';
import { createScriptClient } from '../lib/supabase/script-client';
import type { DateRange } from '../lib/types/nyp-types';
import type { ReportType } from '../lib/types';

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AUTH_JSON_PATH = path.resolve(__dirname, '..', 'auth.json');
const DELAY_BETWEEN_REPORTS_MS = 1_500;

interface DownloadStats {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
}

/**
 * Generate date ranges for the last 6 months
 */
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

/**
 * Check which reports already exist in the database
 */
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
    console.error('  Warning: Failed to check existing reports:', error.message);
    return new Set();
  }

  return new Set((data || []).map((r) => r.report_type as ReportType));
}

/**
 * Upload a report file to Supabase Storage and create database record
 */
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
      console.error(`    Upload failed:`, uploadError.message);
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
      console.error(`    Database insert failed:`, dbError.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`    Upload error:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Extract file content from the Generate response.
 *
 * The NYP portal responds to POST /Reporting/Generate/{type} in one of two ways:
 * 1. Direct file download (Content-Disposition: attachment) — return the bytes
 * 2. HTML page (the report rendered in the browser) — not a downloadable file
 *
 * For Excel reports, the response is typically a direct file download.
 */
async function extractFileFromResponse(
  response: Response,
  reportType: string,
  downloadDir: string,
  year: number,
  month: number
): Promise<{ filePath: string; fileName: string; fileSize: number } | null> {
  const contentDisposition = response.headers.get('Content-Disposition') ?? '';
  const contentType = response.headers.get('Content-Type') ?? '';

  // Case 1: Direct file download (attachment)
  if (contentDisposition.includes('attachment') || contentType.includes('spreadsheet') || contentType.includes('octet-stream')) {
    const buffer = Buffer.from(await response.arrayBuffer());

    // Try to extract filename from Content-Disposition
    const filenameMatch = contentDisposition.match(/filename[*]?=(?:UTF-8''|"?)([^";\n]+)/i);
    const originalName = filenameMatch ? decodeURIComponent(filenameMatch[1].trim()) : null;
    const extension = originalName?.split('.').pop() ?? 'xlsx';
    const monthStr = String(month).padStart(2, '0');
    const fileName = `${reportType}_${year}-${monthStr}.${extension}`;
    const filePath = path.join(downloadDir, fileName);

    await fs.writeFile(filePath, buffer);

    return { filePath, fileName, fileSize: buffer.length };
  }

  // Case 2: HTML response — check if it contains a download link
  if (contentType.includes('text/html')) {
    const html = await response.text();

    // Look for a redirect or download link in the HTML
    const linkMatch = html.match(/href="([^"]*ViewPdf[^"]*)"/i)
      ?? html.match(/href="([^"]*Download[^"]*)"/i)
      ?? html.match(/window\.location\s*=\s*['"]([^'"]+)['"]/i);

    if (linkMatch) {
      // There's a download link — we'd need to follow it
      // For now, log and return null (this path is uncommon for Excel reports)
      console.error(`    HTML response with download link found but not followed: ${linkMatch[1]}`);
    }

    return null;
  }

  return null;
}

/**
 * Download a single report via HTTP API
 */
async function downloadSingleReport(
  client: NYPApiClient,
  reportMeta: { type: ReportType; name: string; nypUrl?: string },
  startDate: Date,
  endDate: Date,
  downloadDir: string
): Promise<{ filePath: string; fileName: string; fileSize: number } | null> {
  try {
    const response = await client.generateReport(
      reportMeta as import('../lib/types').ReportTypeMetadata,
      startDate,
      endDate
    );

    if (!response.ok && response.status !== 200) {
      console.error(`    HTTP ${response.status} for ${reportMeta.name}`);
      return null;
    }

    const year = startDate.getFullYear();
    const month = startDate.getMonth() + 1;

    return extractFileFromResponse(response, reportMeta.type, downloadDir, year, month);
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      throw error; // Bubble up — caller should stop
    }
    console.error(`    Failed to download ${reportMeta.name}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Process downloads for a single month
 */
async function processMonth(
  client: NYPApiClient,
  restaurantId: string,
  dateRange: DateRange,
  downloadDir: string,
  stats: DownloadStats
): Promise<void> {
  console.log(`\nDownloading reports for ${dateRange.label}...`);

  const existingReports = await getExistingReports(restaurantId, dateRange.year, dateRange.month);
  const allReports = getAllReportTypes();
  const reportPeriod = `${dateRange.year}-${String(dateRange.month).padStart(2, '0')}-01`;

  let processed = 0;

  for (const reportMeta of allReports) {
    processed++;
    const progress = `(${processed}/${allReports.length})`;

    if (existingReports.has(reportMeta.type)) {
      console.log(`  SKIP ${reportMeta.name} - Already exists ${progress}`);
      stats.skipped++;
      continue;
    }

    const downloaded = await downloadSingleReport(
      client,
      reportMeta,
      dateRange.start,
      dateRange.end,
      downloadDir
    );

    if (!downloaded) {
      console.log(`  FAIL ${reportMeta.name} ${progress}`);
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
      console.log(`  OK   ${reportMeta.name} (${(downloaded.fileSize / 1024).toFixed(1)} KB) ${progress}`);
      stats.successful++;
    } else {
      console.log(`  FAIL ${reportMeta.name} - Upload failed ${progress}`);
      stats.failed++;
    }

    // Clean up temp file
    try {
      await fs.unlink(downloaded.filePath);
    } catch {
      // Ignore cleanup errors
    }

    // Small delay between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REPORTS_MS));
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('NYP Report Download Automation (HTTP API)\n');

  // Step 1: Validate time restriction
  try {
    validateDownloadTime();
    console.log('Time check: OK (outside 16:00-20:00)\n');
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  // Step 2: Validate environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`Missing environment variable: ${envVar}`);
      process.exit(1);
    }
  }

  // Step 3: Load cookies from auth.json
  console.log(`Loading cookies from ${AUTH_JSON_PATH}...`);
  let client: NYPApiClient;

  try {
    const cookies = await loadCookiesFromFile(AUTH_JSON_PATH);
    client = new NYPApiClient(cookies);
    console.log('Cookies loaded successfully\n');
  } catch (error) {
    console.error('Failed to load cookies:', error instanceof Error ? error.message : String(error));
    console.error('\nTo fix this:');
    console.error('1. Login to store.newyorkpizza.nl in your browser');
    console.error('2. Open DevTools > Application > Cookies');
    console.error('3. Export cookies to auth.json (or use Playwright to capture them)');
    process.exit(1);
  }

  // Step 4: Validate session
  console.log('Validating session...');
  const sessionValid = await client.isSessionValid();

  if (!sessionValid) {
    console.error('Session expired! Please refresh cookies in auth.json from DevTools.');
    process.exit(1);
  }

  await client.keepAlive();
  console.log('Session: OK\n');

  // Step 5: Generate date ranges
  const dateRanges = generateLast6Months();
  console.log(`Downloading reports for 6 months (${dateRanges[0].label} to ${dateRanges[dateRanges.length - 1].label})\n`);

  // Step 6: Setup temporary directory
  const sessionId = uuidv4();
  const tempDir = path.join('/tmp', 'nyp-reports', sessionId);
  await fs.mkdir(tempDir, { recursive: true });
  console.log(`Temp directory: ${tempDir}\n`);

  // Hardcoded restaurant ID — matches auth.json's ActiveStore cookie
  const restaurantId = 'rosmalen';

  const globalStats: DownloadStats = {
    total: getAllReportTypes().length * dateRanges.length,
    successful: 0,
    skipped: 0,
    failed: 0,
  };

  try {
    console.log(`${'='.repeat(60)}`);
    console.log(`Processing restaurant: ${restaurantId.toUpperCase()}`);
    console.log('='.repeat(60));

    for (const dateRange of dateRanges) {
      try {
        await processMonth(client, restaurantId, dateRange, tempDir, globalStats);

        // Keep session alive between months
        await client.keepAlive();
      } catch (error) {
        if (error instanceof SessionExpiredError) {
          console.error('\nSession expired during download! Please refresh auth.json and re-run.');
          break;
        }
        console.error(`\nFailed for ${dateRange.label}:`, error instanceof Error ? error.message : String(error));
        console.log('Continuing with next month...');
      }
    }

    // Step 7: Final summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('All downloads complete!');
    console.log('='.repeat(60));
    console.log(`Final Statistics:`);
    console.log(`  Total reports: ${globalStats.total}`);
    console.log(`  Successful:    ${globalStats.successful}`);
    console.log(`  Skipped:       ${globalStats.skipped}`);
    console.log(`  Failed:        ${globalStats.failed}`);
    console.log('='.repeat(60) + '\n');
  } finally {
    // Step 8: Cleanup
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log(`Temporary files cleaned up\n`);
    } catch {
      console.log(`Could not clean up temporary directory: ${tempDir}\n`);
    }
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
