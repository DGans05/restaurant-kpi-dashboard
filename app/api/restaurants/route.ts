import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { restaurantSchema, restaurantUpdateSchema } from '@/lib/validations/restaurant.schema';
import { createAuditLog } from '@/lib/utils/audit';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    let query = supabase.from('restaurants').select('*');

    // Non-admins only see restaurants they're assigned to
    if (user.profile?.role !== 'admin') {
      const { data: userRestaurants } = await supabase
        .from('user_restaurants')
        .select('restaurant_id')
        .eq('user_id', user.id);

      const restaurantIds = userRestaurants?.map(ur => ur.restaurant_id) || [];
      if (restaurantIds.length === 0) {
        return NextResponse.json({ data: [] });
      }

      query = query.in('id', restaurantIds);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error fetching restaurants:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/restaurants:', error);
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

    if (user.profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = restaurantSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert restaurant
    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        ...validationResult.data,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating restaurant:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create audit log
    await createAuditLog({
      action: 'restaurant_create',
      resource_type: 'restaurant',
      resource_id: data.id,
      changes: { created: data },
      ip_address: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/restaurants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
