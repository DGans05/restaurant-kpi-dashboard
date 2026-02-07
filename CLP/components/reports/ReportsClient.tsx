'use client';

import { Report, ReportType, Restaurant } from '@/lib/types';
import { YearFilter } from './YearFilter';
import { MonthTabs } from './MonthTabs';
import { ReportGrid } from './ReportGrid';

interface ReportsClientProps {
  reportsByType: Map<ReportType, Report | null>;
  availableYears: number[];
  currentYear: number;
  currentMonth: number;
  restaurants: Restaurant[];
  currentRestaurantId?: string;
}

export function ReportsClient({
  reportsByType,
  availableYears,
  currentYear,
  currentMonth,
  restaurants,
  currentRestaurantId,
}: ReportsClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Upload and view restaurant reports</p>
      </div>

      <div className="flex flex-col gap-4">
        <YearFilter years={availableYears} currentYear={currentYear} />
        <MonthTabs currentMonth={currentMonth} />
      </div>

      <ReportGrid
        reportsByType={reportsByType}
        restaurantId={currentRestaurantId || 'rosmalen'}
        year={currentYear}
        month={currentMonth}
      />
    </div>
  );
}
