import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Audit Logs | Restaurant KPI Dashboard',
  description: 'View audit logs of system activities',
};

async function AuditLogsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user || (user.profile?.role !== 'admin' && user.profile?.role !== 'manager')) {
    redirect('/dashboard');
  }

  // Fetch audit logs
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const actionLabels: Record<string, string> = {
    kpi_create: 'Created KPI Entry',
    kpi_update: 'Updated KPI Entry',
    kpi_delete: 'Deleted KPI Entry',
    restaurant_create: 'Created Restaurant',
    restaurant_update: 'Updated Restaurant',
    restaurant_delete: 'Deleted Restaurant',
    user_create: 'Created User',
    user_update: 'Updated User',
    user_delete: 'Deleted User',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">
            View all system activities and changes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Last 100 activities</CardDescription>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between border-b pb-4 last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {actionLabels[log.action] || log.action}
                      </span>
                      <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                        {log.resource_type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      by {log.user_id} • {new Date(log.created_at).toLocaleString()}
                    </p>
                    {log.ip_address && (
                      <p className="text-xs text-muted-foreground mt-1">
                        IP: {log.ip_address}
                      </p>
                    )}
                  </div>
                  {log.changes && (
                    <details className="cursor-pointer">
                      <summary className="text-xs text-primary hover:underline">
                        Details
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-48">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No audit logs found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AuditLogsPage;
