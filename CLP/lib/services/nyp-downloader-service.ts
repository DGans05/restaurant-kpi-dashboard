/**
 * Download service for NYP store reports
 * Handles navigating to report pages, filling forms, and downloading files
 */

import { Page } from 'playwright';
import { promises as fs } from 'fs';
import * as path from 'path';
import { formatForNyp } from '@/lib/utils/date-formatter';
import { DownloadedReport } from '@/lib/types/nyp-types';
import { ReportType, ReportTypeMetadata } from '@/lib/types';
import { getAllReportTypes } from '@/lib/config/report-types';

const NYP_BASE_URL = 'https://store.newyorkpizza.nl';
const DOWNLOAD_TIMEOUT = 60000; // 60 seconds per report

export class NypDownloaderService {
  private page: Page;
  private downloadDir: string;

  constructor(page: Page, downloadDir: string) {
    this.page = page;
    this.downloadDir = downloadDir;
  }

  /**
   * Download a single report for the specified date range
   * @param reportMetadata - Report type metadata from REPORT_TYPES_CONFIG
   * @param startDate - Start date of the report period
   * @param endDate - End date of the report period
   * @returns Downloaded report metadata or null if download failed
   */
  async downloadReport(
    reportMetadata: ReportTypeMetadata,
    startDate: Date,
    endDate: Date
  ): Promise<DownloadedReport | null> {
    const reportUrl = `${NYP_BASE_URL}${reportMetadata.nypUrl}`;

    try {
      console.log(`    📍 Navigating to: ${reportUrl}`);
      // Navigate to report generation page
      await this.page.goto(reportUrl, { waitUntil: 'networkidle', timeout: DOWNLOAD_TIMEOUT });

      // Fill date form fields
      const startDateStr = formatForNyp(startDate);
      const endDateStr = formatForNyp(endDate);
      console.log(`    📅 Date range: ${startDateStr} to ${endDateStr}`);

      // Find date input fields - NYP typically uses names like "StartDate", "EndDate"
      const startDateInput = this.page.locator('input[name*="Start"], input[id*="start"]').first();
      const endDateInput = this.page.locator('input[name*="End"], input[id*="end"]').first();

      await startDateInput.fill(startDateStr);
      await endDateInput.fill(endDateStr);
      console.log(`    ✍️  Filled date fields`);

      // Setup download listener before submitting form
      const downloadPromise = this.page.waitForEvent('download', { timeout: DOWNLOAD_TIMEOUT });

      // Submit form
      const submitButton = this.page.locator('button[type="submit"], input[type="submit"], button:has-text("Genereren")').first();
      console.log(`    🖱️  Clicking submit button...`);
      await submitButton.click();

      console.log(`    ⏳ Waiting for download to start...`);
      // Wait for download to start
      const download = await downloadPromise;
      console.log(`    📥 Download started`);


      // Save file to temp directory
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const fileName = `${reportMetadata.type}_${year}-${month}.xlsx`;
      const filePath = path.join(this.downloadDir, fileName);

      await download.saveAs(filePath);

      // Get file size
      const stats = await fs.stat(filePath);

      return {
        filePath,
        fileName,
        fileSize: stats.size,
        reportType: reportMetadata.type,
      };
    } catch (error) {
      console.error(`  ❌ Failed to download ${reportMetadata.name}:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Download all available reports for a specific month
   * Processes reports in batches to avoid overwhelming the server
   * @param year - Year (e.g., 2026)
   * @param month - Month (1-12)
   * @returns Array of successfully downloaded reports
   */
  async downloadReportsForMonth(year: number, month: number): Promise<DownloadedReport[]> {
    const allReports = getAllReportTypes();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    const downloaded: DownloadedReport[] = [];
    const BATCH_SIZE = 5;

    // Process reports in batches
    for (let i = 0; i < allReports.length; i += BATCH_SIZE) {
      const batch = allReports.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map((reportMeta) => this.downloadReport(reportMeta, startDate, endDate))
      );

      // Collect successful downloads
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value !== null) {
          downloaded.push(result.value);
        }
      }

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < allReports.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return downloaded;
  }
}
