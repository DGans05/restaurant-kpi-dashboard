import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react';

interface KPIDetailPageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: KPIDetailPageProps) {
  return {
    title: 'KPI Entry | Restaurant KPI Dashboard',
    description: 'View KPI entry details',
  };
}

async function KPIDetailPage({ params }: KPIDetailPageProps) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the KPI entry
  const { data: kpi, error: kpiError } = await supabase
    .from('kpis')
    .select(`
      id,
      restaurant_id,
      date,
      revenue,
      labour_cost,
      food_cost,
      order_count,
      restaurants!kpis_restaurant_id_fkey(name)
    `)
    .eq('id', params.id)
    .single();

  if (kpiError || !kpi) {
    notFound();
  }

  const restaurantName = Array.isArray(kpi.restaurants)
    ? (kpi.restaurants[0] as any)?.name
    : (kpi.restaurants as any)?.name;

  // Calculate percentages
  const labourPercent = ((kpi.labour_cost / kpi.revenue) * 100).toFixed(2);
  const foodPercent = ((kpi.food_cost / kpi.revenue) * 100).toFixed(2);
  const totalCosts = kpi.labour_cost + kpi.food_cost;
  const totalCostPercent = ((totalCosts / kpi.revenue) * 100).toFixed(2);
  const profitMargin = (((kpi.revenue - totalCosts) / kpi.revenue) * 100).toFixed(2);

  // Revenue per order
  const revenuePerOrder = (kpi.revenue / kpi.order_count).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/kpis">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">KPI Entry</h1>
            <p className="text-muted-foreground mt-1">
              {restaurantName} • {new Date(kpi.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/kpis/${kpi.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpi.revenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Labour Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpi.labour_cost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{labourPercent}% of revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Food Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpi.food_cost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{foodPercent}% of revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.order_count}</div>
            <p className="text-xs text-muted-foreground mt-1">${revenuePerOrder} per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
            <CardDescription>Breakdown of operational costs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Labour Cost</span>
              <span className="font-semibold">${kpi.labour_cost.toFixed(2)} ({labourPercent}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Food Cost</span>
              <span className="font-semibold">${kpi.food_cost.toFixed(2)} ({foodPercent}%)</span>
            </div>
            <div className="border-t pt-4 flex items-center justify-between">
              <span className="font-semibold">Total Costs</span>
              <span className="font-bold">${totalCosts.toFixed(2)} ({totalCostPercent}%)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profitability</CardTitle>
            <CardDescription>Financial performance summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Gross Profit</span>
              <span className="font-semibold">${(kpi.revenue - totalCosts).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Profit Margin</span>
              <span className="font-semibold">{profitMargin}%</span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md mt-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                Average revenue per order: <strong>${revenuePerOrder}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default KPIDetailPage;
