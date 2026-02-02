import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { userSchema } from '@/lib/validations/user.schema';
import { createAuditLog } from '@/lib/utils/audit';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user || user.profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get total count
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get users
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch users: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user || user.profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = userSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email, full_name, role } = validation.data;

    // Create auth user (this would require admin API key in production)
    // For now, we'll just create the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        email,
        full_name,
        role,
      })
      .select()
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: `Failed to create user: ${profileError.message}` },
        { status: 500 }
      );
    }

    // Log the action
    await createAuditLog({
      action: 'user_create',
      resource_type: 'user',
      resource_id: profile.id,
      changes: {
        email,
        full_name,
        role,
      },
      ip_address: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
