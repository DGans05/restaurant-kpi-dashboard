import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { restaurantUpdateSchema } from '@/lib/validations/restaurant.schema';
import { createAuditLog } from '@/lib/utils/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/restaurants/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validationResult = restaurantUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get existing entry for audit log
    const { data: existingData } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', params.id)
      .single();

    // Update restaurant
    const { data, error } = await supabase
      .from('restaurants')
      .update(validationResult.data)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating restaurant:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create audit log
    await createAuditLog({
      action: 'restaurant_update',
      resource_type: 'restaurant',
      resource_id: data.id,
      changes: {
        before: existingData,
        after: data,
      },
      ip_address: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/restaurants/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();

    // Get entry before deletion for audit log
    const { data: existingData } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', params.id)
      .single();

    // Soft delete by setting is_active to false
    const { data, error } = await supabase
      .from('restaurants')
      .update({ is_active: false })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting restaurant:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create audit log
    await createAuditLog({
      action: 'restaurant_delete',
      resource_type: 'restaurant',
      resource_id: data.id,
      changes: { deleted: existingData },
      ip_address: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/restaurants/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
