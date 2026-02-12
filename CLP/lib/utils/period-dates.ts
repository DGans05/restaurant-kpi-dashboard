import {
  startOfISOWeek,
  endOfISOWeek,
  startOfMonth,
  endOfMonth,
  getISOWeek,
  getISOWeekYear,
  addWeeks,
  addMonths,
  format,
  parse,
} from "date-fns";
import { nl } from "date-fns/locale";
import type { PeriodView } from "@/lib/types";

const EARLIEST_MONTH = "2025-01";

/**
 * Parse an ISO week string (e.g. "2026-W06") into the Monday of that week.
 */
export function parseISOWeekString(weekStr: string): Date {
  // date-fns parse with 'RRRR' (ISO week-year) and 'II' (ISO week)
  return parse(weekStr, "RRRR-'W'II", new Date());
}

/**
 * Format a date into ISO week string (e.g. "2026-W06").
 */
export function formatISOWeek(date: Date): string {
  const weekYear = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${weekYear}-W${String(week).padStart(2, "0")}`;
}

/**
 * Get the current ISO week string.
 */
export function getCurrentWeek(): string {
  return formatISOWeek(new Date());
}

/**
 * Get the current month string (YYYY-MM).
 */
export function getCurrentMonth(): string {
  return format(new Date(), "yyyy-MM");
}

/**
 * Get the start and end dates for a given period.
 * For weeks: Monday through Sunday (inclusive).
 * For months: first day through last day (inclusive).
 */
export function getPeriodDateRange(
  view: PeriodView,
  periodKey: string
): { start: Date; end: Date } {
  if (view === "week") {
    const monday = parseISOWeekString(periodKey);
    return {
      start: startOfISOWeek(monday),
      end: endOfISOWeek(monday),
    };
  }

  // month
  const firstDay = parse(periodKey, "yyyy-MM", new Date());
  return {
    start: startOfMonth(firstDay),
    end: endOfMonth(firstDay),
  };
}

/**
 * Navigate to the next period.
 */
export function getNextPeriod(view: PeriodView, periodKey: string): string {
  if (view === "week") {
    const monday = parseISOWeekString(periodKey);
    return formatISOWeek(addWeeks(monday, 1));
  }

  const firstDay = parse(periodKey, "yyyy-MM", new Date());
  return format(addMonths(firstDay, 1), "yyyy-MM");
}

/**
 * Navigate to the previous period.
 */
export function getPrevPeriod(view: PeriodView, periodKey: string): string {
  if (view === "week") {
    const monday = parseISOWeekString(periodKey);
    return formatISOWeek(addWeeks(monday, -1));
  }

  const firstDay = parse(periodKey, "yyyy-MM", new Date());
  return format(addMonths(firstDay, -1), "yyyy-MM");
}

/**
 * Dutch-locale label for the current period.
 * Week: "Week 6, 2026"
 * Month: "Januari 2026"
 */
export function getPeriodLabel(view: PeriodView, periodKey: string): string {
  if (view === "week") {
    const monday = parseISOWeekString(periodKey);
    const week = getISOWeek(monday);
    const year = getISOWeekYear(monday);
    return `Week ${week}, ${year}`;
  }

  const firstDay = parse(periodKey, "yyyy-MM", new Date());
  const label = format(firstDay, "LLLL yyyy", { locale: nl });
  // Capitalize first letter
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Check if navigation to the previous period is allowed.
 * Earliest allowed: September 2025.
 */
export function canGoPrev(view: PeriodView, periodKey: string): boolean {
  const prev = getPrevPeriod(view, periodKey);

  if (view === "week") {
    const prevMonday = parseISOWeekString(prev);
    const earliestDate = parse(EARLIEST_MONTH, "yyyy-MM", new Date());
    return prevMonday >= earliestDate;
  }

  return prev >= EARLIEST_MONTH;
}

/**
 * Check if navigation to the next period is allowed.
 * Cannot go beyond the current period.
 */
export function canGoNext(view: PeriodView, periodKey: string): boolean {
  if (view === "week") {
    return periodKey < getCurrentWeek();
  }

  return periodKey < getCurrentMonth();
}

/**
 * Get the previous period key (e.g. previous week or previous month).
 */
export function getPreviousPeriodKey(view: PeriodView, periodKey: string): string {
  return getPrevPeriod(view, periodKey);
}

/**
 * When switching views, convert the current period key to the new view.
 * Week → Month: use the month that the week's Monday falls in.
 * Month → Week: use the ISO week of the first day of that month.
 */
export function convertPeriodKey(
  fromView: PeriodView,
  toView: PeriodView,
  periodKey: string
): string {
  if (fromView === toView) return periodKey;

  if (fromView === "week" && toView === "month") {
    const monday = parseISOWeekString(periodKey);
    return format(monday, "yyyy-MM");
  }

  // month → week
  const firstDay = parse(periodKey, "yyyy-MM", new Date());
  return formatISOWeek(firstDay);
}
