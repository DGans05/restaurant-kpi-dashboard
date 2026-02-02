import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { KPIList } from '@/components/kpis/KPIList';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'KPI Entries | Restaurant KPI Dashboard',
  description: 'Manage and view KPI entries',
};

async function KPIPageContent() {
  const supabase = await createClient();

  // Fetch KPI entries with restaurant names
  const { data: kpis, error } = await supabase
    .from('kpis')
    .select(`
      id,
      restaurant_id,
      date,
      revenue,
      labour_cost,
      food_cost,
      order_count,
      restaurants(name)
    `)
    .is('deleted_at', null)
    .order('date', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to fetch KPI entries: ${error.message}`);
  }

  const entries = (kpis || []).map((kpi: any) => ({
    id: kpi.id,
    restaurant_id: kpi.restaurant_id,
    restaurant_name: Array.isArray(kpi.restaurants)
      ? kpi.restaurants[0]?.name
      : kpi.restaurants?.name,
    date: kpi.date,
    revenue: kpi.revenue,
    labour_cost: kpi.labour_cost,
    food_cost: kpi.food_cost,
    order_count: kpi.order_count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KPI Entries</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage restaurant KPI data
          </p>
        </div>
        <Link href="/dashboard/kpis/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <KPIList entries={entries} />
      </Suspense>
    </div>
  );
}

export default function KPIPage() {
  return <KPIPageContent />;
}
