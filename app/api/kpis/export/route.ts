import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');
    const restaurantId = searchParams.get('restaurant_id');

    // Build query
    let query = supabase
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
      .order('date', { ascending: true });

    if (fromDate) {
      query = query.gte('date', fromDate);
    }

    if (toDate) {
      query = query.lte('date', toDate);
    }

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data: kpis, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch KPI data: ${error.message}` },
        { status: 500 }
      );
    }

    if (!kpis || kpis.length === 0) {
      return NextResponse.json(
        { error: 'No data found for export' },
        { status: 404 }
      );
    }

    // Transform data for CSV export
    const csvData = (kpis as any[]).map((kpi) => ({
      restaurant_id: kpi.restaurant_id,
      restaurant_name: Array.isArray(kpi.restaurants)
        ? kpi.restaurants[0]?.name
        : kpi.restaurants?.name,
      date: kpi.date,
      revenue: kpi.revenue,
      labour_cost: kpi.labour_cost,
      food_cost: kpi.food_cost,
      labour_percent: ((kpi.labour_cost / kpi.revenue) * 100).toFixed(2),
      food_percent: ((kpi.food_cost / kpi.revenue) * 100).toFixed(2),
      order_count: kpi.order_count,
      revenue_per_order: (kpi.revenue / kpi.order_count).toFixed(2),
    }));

    // Convert to CSV
    const csv = Papa.unparse(csvData);

    // Create response with CSV file
    const filename = `kpi-export-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
