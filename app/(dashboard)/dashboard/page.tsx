import { getCurrentUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { KPISummaryCards } from '@/components/dashboard/KPISummaryCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { CostBreakdownChart } from '@/components/dashboard/CostBreakdownChart';

export const dynamic = 'force-dynamic';

async function DashboardPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  // Fetch KPI data for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: kpis } = await supabase
    .from('kpis')
    .select('*')
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .is('deleted_at', null)
    .order('date', { ascending: true });

  // Calculate summary metrics
  let totalRevenue = 0;
  let totalLabourCost = 0;
  let totalFoodCost = 0;
  let totalOrders = 0;
  let validEntries = 0;

  const chartData = (kpis || []).map((kpi) => {
    totalRevenue += kpi.revenue;
    totalLabourCost += kpi.labour_cost;
    totalFoodCost += kpi.food_cost;
    totalOrders += kpi.order_count;
    validEntries++;

    return {
      date: new Date(kpi.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      revenue: kpi.revenue,
      orders: kpi.order_count,
      labour_cost: kpi.labour_cost,
      food_cost: kpi.food_cost,
      profit: kpi.revenue - kpi.labour_cost - kpi.food_cost,
    };
  });

  const avgLabourPercent =
    validEntries > 0 ? (totalLabourCost / totalRevenue) * 100 : 0;
  const avgFoodPercent =
    validEntries > 0 ? (totalFoodCost / totalRevenue) * 100 : 0;

  // Get previous period data for comparison (60-90 days ago)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: previousKpis } = await supabase
    .from('kpis')
    .select('*')
    .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
    .lt('date', sixtyDaysAgo.toISOString().split('T')[0])
    .is('deleted_at', null);

  let previousRevenue = 0;
  let previousLabourCost = 0;
  let previousFoodCost = 0;
  let previousValidEntries = 0;

  (previousKpis || []).forEach((kpi) => {
    previousRevenue += kpi.revenue;
    previousLabourCost += kpi.labour_cost;
    previousFoodCost += kpi.food_cost;
    previousValidEntries++;
  });

  const previousLabourPercent =
    previousValidEntries > 0 ? (previousLabourCost / previousRevenue) * 100 : 0;

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.user_metadata?.full_name || user?.email}!
        </p>
      </div>

      <KPISummaryCards
        totalRevenue={totalRevenue}
        avgLabourPercent={avgLabourPercent}
        avgFoodPercent={avgFoodPercent}
        totalOrders={totalOrders}
        previousRevenue={previousRevenue}
        previousLabourPercent={previousLabourPercent}
      />

      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={chartData} />
          <CostBreakdownChart data={chartData} />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No KPI data available yet.{' '}
            <a href="/dashboard/kpis/new" className="text-primary hover:underline">
              Start by adding your first entry
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
