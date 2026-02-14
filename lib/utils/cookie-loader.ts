/**
 * Cookie loader for NYP store API authentication
 * Reads Playwright-format auth.json and converts to HTTP cookie headers
 */

import { promises as fs } from 'fs';
import type { AuthJsonFile, NypCookies } from '@/lib/types/nyp-types';

const REQUIRED_COOKIES = [
  '.AspNet.ApplicationCookie-S4D.Web.Store',
  'ActiveStore',
  'INGRESSCOOKIE',
] as const;

/**
 * Load cookies from Playwright-format auth.json file
 * @param filePath - Path to auth.json
 * @returns Cookie key-value pairs
 * @throws Error if file is missing, invalid, or lacks required cookies
 */
export async function loadCookiesFromFile(filePath: string): Promise<NypCookies> {
  const raw = await fs.readFile(filePath, 'utf-8');
  const authJson: AuthJsonFile = JSON.parse(raw);

  if (!authJson.cookies || !Array.isArray(authJson.cookies)) {
    throw new Error(`Invalid auth.json format: missing "cookies" array`);
  }

  const cookieMap: Record<string, string> = {};
  for (const cookie of authJson.cookies) {
    if (cookie.domain.includes('newyorkpizza.nl')) {
      cookieMap[cookie.name] = cookie.value;
    }
  }

  const missing = REQUIRED_COOKIES.filter((name) => !cookieMap[name]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required cookies in auth.json: ${missing.join(', ')}\n` +
      `Please re-export cookies from DevTools.`
    );
  }

  return cookieMap as NypCookies;
}

/**
 * Convert cookie key-value pairs to a Cookie header string
 * @param cookies - Cookie key-value pairs
 * @returns Formatted string for the Cookie HTTP header
 */
export function cookiesToHeaderString(cookies: NypCookies): string {
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}
