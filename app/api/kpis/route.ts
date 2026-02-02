import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { kpiEntrySchema } from '@/lib/validations/kpi.schema';
import { createAuditLog } from '@/lib/utils/audit';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get query parameters for pagination and filtering
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const restaurantId = searchParams.get('restaurant_id');
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    let query = supabase
      .from('kpi_entries')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Filter by restaurant if provided
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    // Filter by date range
    if (fromDate) {
      query = query.gte('date', fromDate);
    }
    if (toDate) {
      query = query.lte('date', toDate);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1).order('date', { ascending: false });

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching KPI entries:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/kpis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or manager
    if (!['admin', 'manager'].includes(user.profile?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = kpiEntrySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert KPI entry
    const { data, error } = await supabase
      .from('kpi_entries')
      .insert({
        ...validationResult.data,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating KPI entry:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create audit log
    await createAuditLog({
      action: 'kpi_create',
      resource_type: 'kpi_entry',
      resource_id: data.id,
      changes: { created: data },
      ip_address: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/kpis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
