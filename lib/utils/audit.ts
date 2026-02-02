import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth';

interface AuditLogInput {
  action: string;
  resource_type: string;
  resource_id?: string;
  changes?: Record<string, unknown>;
  ip_address?: string;
}

export async function createAuditLog({
  action,
  resource_type,
  resource_id,
  changes,
  ip_address,
}: AuditLogInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.warn('Cannot create audit log: no user found');
      return null;
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action,
        resource_type,
        resource_id,
        changes,
        ip_address,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating audit log:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createAuditLog:', error);
    return null;
  }
}

export function extractIpAddress(request?: Request): string | undefined {
  if (!request) return undefined;

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return undefined;
}
