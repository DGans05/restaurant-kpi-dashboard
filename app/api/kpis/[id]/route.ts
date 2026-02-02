import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { kpiEntryUpdateSchema } from '@/lib/validations/kpi.schema';
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
      .from('kpi_entries')
      .select('*')
      .eq('id', params.id)
      .is('deleted_at', null)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/kpis/[id]:', error);
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

    // Check if user is admin or manager
    if (!['admin', 'manager'].includes(user.profile?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = kpiEntryUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get existing entry for audit log
    const { data: existingData } = await supabase
      .from('kpi_entries')
      .select('*')
      .eq('id', params.id)
      .single();

    // Update KPI entry
    const { data, error } = await supabase
      .from('kpi_entries')
      .update(validationResult.data)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating KPI entry:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create audit log
    await createAuditLog({
      action: 'kpi_update',
      resource_type: 'kpi_entry',
      resource_id: data.id,
      changes: {
        before: existingData,
        after: data,
      },
      ip_address: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/kpis/[id]:', error);
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

    // Check if user is admin or manager
    if (!['admin', 'manager'].includes(user.profile?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();

    // Get entry before deletion for audit log
    const { data: existingData } = await supabase
      .from('kpi_entries')
      .select('*')
      .eq('id', params.id)
      .single();

    // Soft delete by setting deleted_at
    const { data, error } = await supabase
      .from('kpi_entries')
      .update({ deleted_at: new Date() })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting KPI entry:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create audit log
    await createAuditLog({
      action: 'kpi_delete',
      resource_type: 'kpi_entry',
      resource_id: data.id,
      changes: { deleted: existingData },
      ip_address: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/kpis/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
