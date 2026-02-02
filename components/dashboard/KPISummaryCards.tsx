'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface KPISummaryCardsProps {
  totalRevenue: number;
  avgLabourPercent: number;
  avgFoodPercent: number;
  totalOrders: number;
  previousRevenue?: number;
  previousLabourPercent?: number;
}

export function KPISummaryCards({
  totalRevenue,
  avgLabourPercent,
  avgFoodPercent,
  totalOrders,
  previousRevenue,
  previousLabourPercent,
}: KPISummaryCardsProps) {
  const revenueTrend = previousRevenue ? totalRevenue - previousRevenue : 0;
  const revenueTrendPercent =
    previousRevenue && previousRevenue > 0
      ? ((revenueTrend / previousRevenue) * 100).toFixed(1)
      : '0.0';

  const labourTrend = previousLabourPercent ? avgLabourPercent - previousLabourPercent : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          {revenueTrend !== 0 && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {revenueTrend > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+{revenueTrendPercent}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">{revenueTrendPercent}%</span>
                </>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Avg Labour Cost % */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Labour %</CardTitle>
          <div className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgLabourPercent.toFixed(1)}%</div>
          {labourTrend !== 0 && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {labourTrend < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Improved</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">Increased</span>
                </>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Avg Food Cost % */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Food %</CardTitle>
          <div className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgFoodPercent.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Target: &lt;30% for optimal margins
          </p>
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <div className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Avg: ${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}/order
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
