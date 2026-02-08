/**
 * HTTP API client for New York Pizza Store Portal
 * Replaces Playwright browser automation with direct fetch() calls
 *
 * Auth uses cookies from auth.json (manually refreshed from DevTools when expired).
 * Cookies expire after ~11 hours of inactivity.
 */

import { cookiesToHeaderString } from '@/lib/utils/cookie-loader';
import { formatForNyp } from '@/lib/utils/date-formatter';
import type { NypCookies } from '@/lib/types/nyp-types';
import type { ReportTypeMetadata } from '@/lib/types';

const NYP_BASE_URL = 'https://store.newyorkpizza.nl';
const REQUEST_TIMEOUT_MS = 60_000;

export class SessionExpiredError extends Error {
  constructor(message = 'Session expired. Please refresh cookies in auth.json from DevTools.') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

export class NypApiError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'NypApiError';
    this.statusCode = statusCode;
  }
}

interface RequestOptions {
  readonly method: 'GET' | 'POST';
  readonly endpoint: string;
  readonly body?: URLSearchParams;
  readonly followRedirects?: boolean;
}

export class NYPApiClient {
  private readonly cookies: Map<string, string>;
  private readonly headers: Record<string, string>;

  constructor(cookies: NypCookies) {
    // Initialize cookie jar from NypCookies object
    this.cookies = new Map(Object.entries(cookies));

    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'nl-NL,nl;q=0.9',
      'Origin': NYP_BASE_URL,
      'Referer': `${NYP_BASE_URL}/Reporting`,
    };
  }

  /**
   * Generate Cookie header string from current cookie jar
   */
  private getCookieHeader(): string {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  /**
   * Parse Set-Cookie headers and update cookie jar
   */
  private updateCookiesFromResponse(response: Response, debug = false): void {
    // Try getSetCookie() first (standard), fallback to get('set-cookie')
    let setCookieHeaders: string[] = [];

    if (typeof response.headers.getSetCookie === 'function') {
      setCookieHeaders = response.headers.getSetCookie();
    } else {
      // Fallback for environments where getSetCookie() isn't available
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        // set-cookie header can contain multiple cookies separated by commas
        // But commas can also appear in cookie values (expires dates), so we need careful parsing
        setCookieHeaders = setCookieHeader.split(/,(?=[^;]+?=)/);
      }
    }

    if (debug && setCookieHeaders.length > 0) {
      console.log(`  Received ${setCookieHeaders.length} Set-Cookie headers`);
    }

    for (const setCookie of setCookieHeaders) {
      // Parse cookie: "name=value; Path=/; HttpOnly; Secure"
      const parts = setCookie.split(';');
      const [nameValue] = parts;

      if (!nameValue) continue;

      const equalsIndex = nameValue.indexOf('=');
      if (equalsIndex === -1) continue;

      const name = nameValue.substring(0, equalsIndex).trim();
      const value = nameValue.substring(equalsIndex + 1).trim();

      if (name && value !== undefined) {
        this.cookies.set(name, value);
        if (debug) {
          console.log(`  Updated cookie: ${name}=${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
        }
      }
    }
  }

  /**
   * Make an authenticated request, detecting session expiry via 302 → login redirect
   */
  private async request(options: RequestOptions & { debug?: boolean }): Promise<Response> {
    const url = `${NYP_BASE_URL}${options.endpoint}`;

    const headers: Record<string, string> = {
      ...this.headers,
      'Cookie': this.getCookieHeader(), // Use dynamic cookie header
    };

    if (options.body) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: options.method,
        headers,
        body: options.body?.toString(),
        redirect: options.followRedirects === false ? 'manual' : 'follow',
        signal: controller.signal,
      });

      // Update cookie jar from Set-Cookie headers
      this.updateCookiesFromResponse(response, options.debug);

      // Detect session expiry: 302 redirect to login page
      if (response.status === 302) {
        const location = response.headers.get('Location') ?? '';
        if (location.includes('/Account/Login') || location.includes('/Account/VerifyLogin')) {
          throw new SessionExpiredError();
        }
      }

      // Also detect login page in followed redirects
      if (response.redirected && response.url.includes('/Account/Login')) {
        throw new SessionExpiredError();
      }

      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Keep session alive by calling UpdateLastActivity
   * The endpoint may return 404 but still refreshes the session cookie —
   * what matters is that it does NOT redirect to /Account/Login.
   * @returns true if session is still valid
   */
  async keepAlive(): Promise<boolean> {
    try {
      await this.request({
        method: 'POST',
        endpoint: '/Account/UpdateLastActivity',
      });
      return true; // No SessionExpiredError thrown = session is alive
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Check if the current session is valid by requesting the Reporting page.
   * An expired session redirects to /Account/Login.
   * @returns true if authenticated, false if session expired
   */
  async isSessionValid(): Promise<boolean> {
    try {
      const response = await this.request({
        method: 'GET',
        endpoint: '/Reporting',
        followRedirects: false,
      });
      // 200 = logged in, 302 to non-login = still OK
      if (response.ok) {
        return true;
      }
      // 302 is handled by this.request() — if it reaches here, the redirect
      // was NOT to /Account/Login so session is valid
      return response.status === 302;
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Switch to a different store in the NYP system.
   * The store context is maintained in the ActiveStore cookie.
   *
   * @param storeId - NYP store ID (e.g., 142 for Hinthammerstraat, 197 for Rosmalen)
   * @returns true if store switch was successful
   */
  async switchStore(storeId: number): Promise<boolean> {
    try {
      console.log(`  Setting ActiveStore cookie to ${storeId}`);

      // Directly set the ActiveStore cookie
      // The NYP system uses this cookie to determine which store context to use
      this.cookies.set('ActiveStore', storeId.toString());

      console.log(`  ActiveStore cookie set to: ${this.cookies.get('ActiveStore')}`);

      // Verify the switch worked by checking a page
      console.log(`  Verifying switch by checking /Store page`);

      const verifyResponse = await this.request({
        method: 'GET',
        endpoint: '/Store',
      });

      console.log(`  Verify response status: ${verifyResponse.status}`);

      if (!verifyResponse.ok) {
        console.log(`  Verification request failed`);
        return false;
      }

      const html = await verifyResponse.text();

      // Save HTML to file for debugging
      if (typeof require !== 'undefined') {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const debugFile = path.join('/tmp', `nyp-store-${storeId}.html`);
          await fs.promises.writeFile(debugFile, html, 'utf-8');
          console.log(`  Saved response HTML to: ${debugFile}`);
        } catch (err) {
          console.log(`  Could not save HTML: ${err}`);
        }
      }

      // Check which store is currently active (shown in the header)
      const activeStoreMatch = html.match(/class="s4d-store-toggle"[^>]*>\s*([^<]+)<\/a>/i);
      if (activeStoreMatch) {
        console.log(`  Currently active store from header: ${activeStoreMatch[1].trim()}`);
      } else {
        console.log(`  Could not find active store in header`);
      }

      // Extract the ActiveStore cookie value from any Set-Cookie headers
      const activeStoreCookieValue = this.cookies.get('ActiveStore');
      console.log(`  ActiveStore cookie value: ${activeStoreCookieValue}`);

      // Check if the page shows the correct store ID in the dropdown
      const containsStoreId = html.includes(`data-storeid="${storeId}"`);

      console.log(`  Page contains store ID ${storeId}: ${containsStoreId}`);

      // List all store IDs present in the HTML
      const allStoreIds = Array.from(html.matchAll(/data-storeid="(\d+)"/g), m => m[1]);
      console.log(`  All store IDs in page: ${allStoreIds.join(', ')}`);

      return containsStoreId;
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        console.log(`  Session expired during store switch`);
        return false;
      }
      console.error('  Store switch error:', error);
      return false;
    }
  }

  /**
   * Extract the CSRF token and hidden form fields from an HTML page
   */
  private extractFormFields(html: string): Record<string, string> {
    const fields: Record<string, string> = {};
    const inputRegex = /<input[^>]*>/gi;
    let match: RegExpExecArray | null;

    while ((match = inputRegex.exec(html)) !== null) {
      const input = match[0];
      const typeMatch = input.match(/type=['"]([^'"]+)['"]/i);
      const type = typeMatch?.[1]?.toLowerCase() ?? 'text';

      // Only extract hidden inputs and date fields
      if (type !== 'hidden' && type !== 'datetime') continue;

      const nameMatch = input.match(/name=['"]([^'"]+)['"]/i);
      const valueMatch = input.match(/value=['"]([^'"]*)['"]/i);

      if (nameMatch) {
        const name = nameMatch[1];
        const value = valueMatch?.[1] ?? '';
        // For duplicate __RequestVerificationToken, keep the first one
        if (!(name in fields)) {
          fields[name] = value;
        }
      }
    }

    return fields;
  }

  /**
   * Extract the DownloadExcel URL from the report result HTML
   */
  private extractDownloadUrl(html: string, format: 'excel' | 'pdf' = 'excel'): string | null {
    const endpoint = format === 'excel' ? 'DownloadExcel' : 'DownloadPdf';
    const regex = new RegExp(`href="(/Reporting/${endpoint}\\?encodedReportData=[^"]+)"`, 'i');
    const match = html.match(regex);
    return match?.[1] ?? null;
  }

  /**
   * Generate and download a report as Excel.
   *
   * Three-step process:
   * 1. GET the form page to extract CSRF token + hidden fields
   * 2. POST with all form fields + our date range → returns HTML with download links
   * 3. GET the DownloadExcel URL to fetch the actual .xlsx file
   *
   * @param reportMeta - Report type metadata with nypUrl
   * @param startDate - Start date of report period
   * @param endDate - End date of report period
   * @returns Response containing the Excel file
   */
  async generateReport(
    reportMeta: ReportTypeMetadata,
    startDate: Date,
    endDate: Date
  ): Promise<Response> {
    if (!reportMeta.nypUrl) {
      throw new NypApiError(`No nypUrl configured for report type: ${reportMeta.type}`, 0);
    }

    // Step 1: GET the form page to extract CSRF token and hidden fields
    const formPage = await this.request({
      method: 'GET',
      endpoint: reportMeta.nypUrl,
    });

    const formHtml = await formPage.text();
    const formFields = this.extractFormFields(formHtml);

    // Step 2: Override date fields and POST
    formFields['DateStart'] = formatForNyp(startDate);
    formFields['DateEnd'] = formatForNyp(endDate);

    const body = new URLSearchParams(formFields);

    const reportResponse = await this.request({
      method: 'POST',
      endpoint: reportMeta.nypUrl,
      body,
    });

    // If the response is already a file (Content-Disposition), return as-is
    const contentDisposition = reportResponse.headers.get('Content-Disposition') ?? '';
    if (contentDisposition.includes('attachment')) {
      return reportResponse;
    }

    // Step 3: Parse HTML for the DownloadExcel link and fetch the file
    const resultHtml = await reportResponse.text();
    const downloadUrl = this.extractDownloadUrl(resultHtml, reportMeta.fileType === 'pdf' ? 'pdf' : 'excel');

    if (!downloadUrl) {
      throw new NypApiError(
        `No download link found in report response for ${reportMeta.name}`,
        reportResponse.status
      );
    }

    return this.request({
      method: 'GET',
      endpoint: downloadUrl,
    });
  }

  /**
   * Get a PDF report via the ViewPdf endpoint
   *
   * @param reportId - Report type ID (e.g., 25 for Operational)
   * @param startDate - Start date (ISO)
   * @param endDate - End date (ISO)
   * @param userId - Authenticated user ID
   * @returns PDF bytes as ArrayBuffer
   */
  async getReportPdf(
    reportId: number,
    startDate: Date,
    endDate: Date,
    userId: number
  ): Promise<ArrayBuffer> {
    const filters = {
      ReportId: reportId,
      Filters: {
        DateStart: startDate.toISOString(),
        DateEnd: endDate.toISOString(),
        Delivery: true,
        Pickup: true,
        PersonIds: [],
        SplitOptionOnResult: false,
        TopResults: 0,
        AutenticatedUserId: userId,
        FilterByDeliveryTypes: false,
        FilterByReturnTypes: false,
        FilterBtSupplierRouteIds: false,
        ShowAllCashDrawerTransactions: false,
        GroupByEmployeeShift: false,
        IncludeSalesPerChannel: false,
        ProductsIds: [],
        Interval: 60,
        SummarizeWeeks: false,
        SummarizeDeliveryTypes: false,
        StockProductId: 0,
        AggregateRangeOption: 0,
        HaveGroupingOption: false,
        StoredProcedureName: '',
      },
    };

    const encoded = Buffer.from(JSON.stringify(filters)).toString('base64');

    const response = await this.request({
      method: 'GET',
      endpoint: `/Reporting/ViewPdf?encodedReportData=${encoded}`,
    });

    const contentType = response.headers.get('Content-Type') ?? '';
    if (!contentType.includes('application/pdf')) {
      throw new NypApiError(
        `Expected PDF response, got Content-Type: ${contentType}`,
        response.status
      );
    }

    return response.arrayBuffer();
  }
}
