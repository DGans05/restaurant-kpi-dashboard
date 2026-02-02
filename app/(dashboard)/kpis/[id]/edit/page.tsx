import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { KPIForm } from '@/components/kpis/KPIForm';
import { type KPIEntryInput } from '@/lib/validations/kpi.schema';

export const dynamic = 'force-dynamic';

interface KPIEditPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: 'Edit KPI Entry | Restaurant KPI Dashboard',
  description: 'Edit a KPI entry',
};

async function KPIEditPage({ params }: KPIEditPageProps) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the KPI entry
  const { data: kpi, error: kpiError } = await supabase
    .from('kpis')
    .select('*')
    .eq('id', params.id)
    .single();

  if (kpiError || !kpi) {
    notFound();
  }

  // Fetch restaurants
  let restaurants = [];
  if (user.role === 'admin') {
    const { data } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    restaurants = data || [];
  } else {
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
      date: formData.date instanceof Date ? formData.date.toISOString() : formData.date,
      revenue: parseFloat(String(formData.revenue)),
      labour_cost: parseFloat(String(formData.labour_cost)),
      food_cost: parseFloat(String(formData.food_cost)),
      order_count: parseInt(String(formData.order_count), 10),
    };

    // Call API to update KPI entry
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/kpis/${params.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update KPI entry');
    }

    redirect('/dashboard/kpis');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit KPI Entry</h1>
        <p className="text-muted-foreground mt-1">
          Update KPI entry for {kpi.date}
        </p>
      </div>

      <KPIForm
        restaurants={restaurants}
        initialData={{
          restaurant_id: kpi.restaurant_id,
          date: kpi.date,
          revenue: kpi.revenue,
          labour_cost: kpi.labour_cost,
          food_cost: kpi.food_cost,
          order_count: kpi.order_count,
        }}
        onSubmit={handleSubmit}
        mode="edit"
      />
    </div>
  );
}

export default KPIEditPage;
