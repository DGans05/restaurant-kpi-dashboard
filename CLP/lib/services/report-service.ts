import { SupabaseReportRepository } from '@/lib/repositories';
import { Report, ReportType } from '@/lib/types';
import { REPORT_TYPES_CONFIG } from '@/lib/config/report-types';

const reportRepo = new SupabaseReportRepository();

export async function getReportsByMonth(
  restaurantId: string,
  year: number,
  month: number
): Promise<Report[]> {
  return reportRepo.findByPeriod(restaurantId, year, month);
}

export async function getReportById(id: string): Promise<Report | null> {
  return reportRepo.findById(id);
}

export async function getAvailableYears(restaurantId: string): Promise<number[]> {
  return reportRepo.getAvailableYears(restaurantId);
}

/**
 * Group reports by type for grid display
 * Returns a Map where each report type has either a Report or null (not uploaded)
 */
export function groupReportsByType(reports: Report[]): Map<ReportType, Report | null> {
  const grouped = new Map<ReportType, Report | null>();

  // Initialize all report types as null (not uploaded)
  const allTypes = Object.keys(REPORT_TYPES_CONFIG) as ReportType[];
  for (const type of allTypes) {
    grouped.set(type, null);
  }

  // Fill in uploaded reports
  for (const report of reports) {
    grouped.set(report.reportType, report);
  }

  return grouped;
}
