'use client';

import { Report, ReportType } from '@/lib/types';
import { getAllReportTypes } from '@/lib/config/report-types';
import { ReportCard } from './ReportCard';

interface ReportGridProps {
  reportsByType: Map<ReportType, Report | null>;
  restaurantId: string;
  year: number;
  month: number;
}

export function ReportGrid({
  reportsByType,
  restaurantId,
  year,
  month,
}: ReportGridProps) {
  const allTypes = getAllReportTypes();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {allTypes.map((metadata) => {
        const report = reportsByType.get(metadata.type) ?? null;
        return (
          <ReportCard
            key={metadata.type}
            metadata={metadata}
            report={report}
            restaurantId={restaurantId}
            year={year}
            month={month}
          />
        );
      })}
    </div>
  );
}
