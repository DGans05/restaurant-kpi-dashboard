import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { userSchema } from '@/lib/validations/user.schema';
import { createAuditLog } from '@/lib/utils/audit';
import { NextRequest, NextResponse } from 'next/server';

interface UserRouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: UserRouteContext) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user || user.profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: UserRouteContext) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user || user.profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = userSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Get current user data for audit
    const { data: beforeData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single();

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(validation.data)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update user: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Log the action
    await createAuditLog({
      action: 'user_update',
      resource_type: 'user',
      resource_id: params.id,
      changes: {
        before: beforeData,
        after: updatedProfile,
      },
      ip_address: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: UserRouteContext) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user || user.profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get user data for audit
    const { data: userData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single();

    // Delete user (this should cascade to related data)
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      return NextResponse.json(
        { error: `Failed to delete user: ${deleteError.message}` },
        { status: 500 }
      );
    }

    // Log the action
    await createAuditLog({
      action: 'user_delete',
      resource_type: 'user',
      resource_id: params.id,
      changes: userData,
      ip_address: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
