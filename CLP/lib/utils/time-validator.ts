/**
 * Time validation utilities for NYP report downloads
 * NYP store disables reports between 16:00-20:00
 */

/**
 * Check if current time is within restricted hours (16:00-20:00)
 * @returns true if within restricted hours, false otherwise
 */
export function isWithinRestrictedHours(): boolean {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 16 && hour < 20;
}

/**
 * Validate that downloads can run at current time
 * @throws Error if within restricted hours
 */
export function validateDownloadTime(): void {
  if (isWithinRestrictedHours()) {
    const nextAvailable = getNextAvailableTime();
    throw new Error(
      `Report downloads are disabled between 16:00-20:00.\n` +
      `Next available time: ${nextAvailable.toLocaleString()}\n` +
      `Please run this script outside these hours.`
    );
  }
}

/**
 * Get the next available time for downloads
 * If currently within restricted hours, returns 20:00 today
 * Otherwise returns current time
 */
export function getNextAvailableTime(): Date {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 16 && hour < 20) {
    const nextRun = new Date(now);
    nextRun.setHours(20, 0, 0, 0);
    return nextRun;
  }

  return now;
}
