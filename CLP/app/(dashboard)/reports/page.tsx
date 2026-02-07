import { Suspense } from 'react';
import {
  getReportsByMonth,
  getAvailableYears,
  groupReportsByType,
} from '@/lib/services/report-service';
import { getAllRestaurants } from '@/lib/services/restaurant-service';
import { ReportsClient } from '@/components/reports/ReportsClient';

export const dynamic = 'force-dynamic';

interface ReportsPageProps {
  searchParams: Promise<{ year?: string; month?: string; restaurantId?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const year = Number(params.year) || new Date().getFullYear();
  const month = Number(params.month) || new Date().getMonth() + 1;
  const restaurantId = params.restaurantId || 'rosmalen';

  const [reports, availableYears, restaurants] = await Promise.all([
    getReportsByMonth(restaurantId, year, month),
    getAvailableYears(restaurantId),
    getAllRestaurants(),
  ]);

  const reportsByType = groupReportsByType(reports);

  return (
    <Suspense fallback={<div>Loading reports...</div>}>
      <ReportsClient
        reportsByType={reportsByType}
        availableYears={availableYears}
        currentYear={year}
        currentMonth={month}
        restaurants={restaurants}
        currentRestaurantId={restaurantId}
      />
    </Suspense>
  );
}
