/**
 * Type definitions for NYP report download system
 */

/**
 * Cookie key-value pairs extracted from auth.json
 */
export interface NypCookies {
  readonly '.AspNet.ApplicationCookie-S4D.Web.Store': string;
  readonly '__RequestVerificationToken': string;
  readonly 'ActiveStore': string;
  readonly 'INGRESSCOOKIE': string;
  readonly [key: string]: string;
}

/**
 * Raw cookie entry from Playwright's auth.json format
 */
export interface AuthJsonCookie {
  readonly name: string;
  readonly value: string;
  readonly domain: string;
  readonly path: string;
  readonly expires: number;
  readonly httpOnly: boolean;
  readonly secure: boolean;
  readonly sameSite: string;
}

/**
 * Structure of Playwright's auth.json file
 */
export interface AuthJsonFile {
  readonly cookies: readonly AuthJsonCookie[];
  readonly origins: readonly unknown[];
}

/**
 * Metadata for a downloaded report file
 */
export interface DownloadedReport {
  filePath: string;    // Path to downloaded file in /tmp
  fileName: string;    // Original file name
  fileSize: number;    // File size in bytes
  reportType: string;  // Report type identifier (e.g., 'operationeel')
}

/**
 * Date range for a specific month
 */
export interface DateRange {
  year: number;      // Year (e.g., 2026)
  month: number;     // Month (1-12)
  start: Date;       // First day of month
  end: Date;         // Last day of month
  label: string;     // Human-readable label (e.g., "Jan 2026")
}
