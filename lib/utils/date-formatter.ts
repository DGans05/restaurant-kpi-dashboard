/**
 * Date formatting utilities for NYP report system
 */

/**
 * Convert Date to "D-M-YYYY" format for NYP forms
 * Example: new Date(2026, 1, 6) → "6-2-2026"
 */
export function formatForNyp(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Convert Date to "YYYY-MM-DD" format for our database
 * Example: new Date(2026, 1, 6) → "2026-02-06"
 */
export function formatForOurSystem(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Generate start and end dates for a specific month
 * @param year - The year (e.g., 2026)
 * @param month - The month (1-12)
 * @returns Object with start date (first day of month) and end date (last day of month)
 */
export function generateMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1); // month is 1-indexed input, convert to 0-indexed
  const end = new Date(year, month, 0); // Day 0 of next month = last day of current month
  return { start, end };
}
