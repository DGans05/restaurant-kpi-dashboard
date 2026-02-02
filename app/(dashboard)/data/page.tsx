import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/auth';
import { ImportExportKPIs } from '@/components/import-export/ImportExportKPIs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Import/Export | Restaurant KPI Dashboard',
  description: 'Import and export KPI data',
};

async function ImportExportPage() {
  const user = await getCurrentUser();

  if (!user || (user.profile?.role !== 'admin' && user.profile?.role !== 'manager')) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
        <p className="text-muted-foreground mt-1">
          Import KPI data from CSV or export for analysis and backup
        </p>
      </div>

      <ImportExportKPIs />
    </div>
  );
}

export default ImportExportPage;
