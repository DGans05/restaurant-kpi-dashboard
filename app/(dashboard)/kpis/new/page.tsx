import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { KPIForm } from '@/components/kpis/KPIForm';
import { type KPIEntryInput } from '@/lib/validations/kpi.schema';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'New KPI Entry | Restaurant KPI Dashboard',
  description: 'Create a new KPI entry',
};

async function NewKPIPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch restaurants accessible to this user
  let restaurants = [];

  if (user.role === 'admin') {
    // Admins see all restaurants
    const { data } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    restaurants = data || [];
  } else {
    // Managers and viewers see only assigned restaurants
    const { data } = await supabase
      .from('user_restaurants')
      .select('restaurants(id, name)')
      .eq('user_id', user.id)
      .order('restaurants(name)');

    restaurants = (data || [])
      .map((ur: any) => ur.restaurants)
      .filter(Boolean);
  }

  async function handleSubmit(formData: KPIEntryInput) {
    'use server';

    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    // Prepare data
    const payload = {
      restaurant_id: formData.restaurant_id,
      date: formData.date instanceof Date ? formData.date.toISOString() : formData.date,
      revenue: parseFloat(String(formData.revenue)),
      labour_cost: parseFloat(String(formData.labour_cost)),
      food_cost: parseFloat(String(formData.food_cost)),
      order_count: parseInt(String(formData.order_count), 10),
    };

    // Call API to create KPI entry
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/kpis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create KPI entry');
    }

    redirect('/dashboard/kpis');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New KPI Entry</h1>
        <p className="text-muted-foreground mt-1">
          Add a new KPI entry for your restaurant
        </p>
      </div>

      <KPIForm
        restaurants={restaurants}
        onSubmit={handleSubmit}
        mode="create"
      />
    </div>
  );
}

export default NewKPIPage;
