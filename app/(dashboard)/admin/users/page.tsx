import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { Button } from '@/components/ui/button';
import { UserList } from '@/components/admin/UserList';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Users | Restaurant KPI Dashboard',
  description: 'Manage system users',
};

async function UsersPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user || user.profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch users
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage system users and their roles
          </p>
        </div>
        <Link href="/dashboard/admin/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New User
          </Button>
        </Link>
      </div>

      <UserList
        users={users || []}
      />
    </div>
  );
}

export default UsersPage;
