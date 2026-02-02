'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { kpiEntrySchema, type KPIEntryInput } from '@/lib/validations/kpi.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface KPIFormProps {
  restaurants: Array<{ id: string; name: string }>;
  initialData?: Partial<KPIEntryInput>;
  onSubmit: (data: KPIEntryInput) => Promise<void>;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export function KPIForm({
  restaurants,
  initialData,
  onSubmit,
  isLoading = false,
  mode = 'create',
}: KPIFormProps) {
  const [labourPercent, setLabourPercent] = useState(0);
  const [foodPercent, setFoodPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<KPIEntryInput>({
    resolver: zodResolver(kpiEntrySchema),
    defaultValues: {
      restaurant_id: initialData?.restaurant_id || '',
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      revenue: initialData?.revenue || 0,
      labour_cost: initialData?.labour_cost || 0,
      food_cost: initialData?.food_cost || 0,
      order_count: initialData?.order_count || 0,
    } as any,
  });

  // Watch values to calculate percentages
  const revenue = form.watch('revenue') as number;
  const labourCost = form.watch('labour_cost') as number;
  const foodCost = form.watch('food_cost') as number;

  // Update percentages when revenue or costs change
  if (revenue > 0) {
    const newLabourPercent = ((labourCost / revenue) * 100).toFixed(2);
    const newFoodPercent = ((foodCost / revenue) * 100).toFixed(2);

    if (labourPercent !== parseFloat(newLabourPercent)) {
      setLabourPercent(parseFloat(newLabourPercent));
    }
    if (foodPercent !== parseFloat(newFoodPercent)) {
      setFoodPercent(parseFloat(newFoodPercent));
    }
  }

  async function handleSubmit(values: KPIEntryInput) {
    try {
      setError(null);
      // Convert date string to Date object
      if (typeof values.date === 'string') {
        values.date = new Date(values.date);
      }
      await onSubmit(values);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save KPI entry';
      setError(message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Add KPI Entry' : 'Edit KPI Entry'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Record a new daily KPI entry'
            : 'Update the KPI entry details'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950 rounded-md">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Restaurant selector */}
            <FormField
              control={form.control}
              name="restaurant_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restaurant</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isLoading || mode === 'edit'}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select a restaurant</option>
                      {restaurants.map((restaurant) => (
                        <option key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isLoading}
                      {...field}
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Revenue */}
            <FormField
              control={form.control}
              name="revenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Revenue</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Labour Cost */}
            <FormField
              control={form.control}
              name="labour_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Labour Cost {labourPercent > 0 && `(${labourPercent}%)`}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Food Cost */}
            <FormField
              control={form.control}
              name="food_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Cost {foodPercent > 0 && `(${foodPercent}%)`}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Order Count */}
            <FormField
              control={form.control}
              name="order_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      step="1"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cost validation hint */}
            {labourPercent + foodPercent > 100 && (
              <div className="p-3 text-sm text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950 rounded-md">
                ⚠️ Labour cost + Food cost ({(labourPercent + foodPercent).toFixed(2)}%) exceeds revenue
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Entry' : 'Update Entry'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
