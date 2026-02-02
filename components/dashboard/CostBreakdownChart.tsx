'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CostBreakdownChartProps {
  data: Array<{
    date: string;
    labour_cost: number;
    food_cost: number;
    profit: number;
  }>;
}

export function CostBreakdownChart({ data }: CostBreakdownChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
        <CardDescription>Labour, food costs, and profit comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke="currentColor"
              style={{ fontSize: '0.875rem' }}
            />
            <YAxis
              stroke="currentColor"
              style={{ fontSize: '0.875rem' }}
            />
            <Tooltip
              formatter={(value) => `$${Number(value).toFixed(2)}`}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
              }}
            />
            <Legend />
            <Bar dataKey="labour_cost" fill="hsl(0, 84%, 60%)" name="Labour" />
            <Bar dataKey="food_cost" fill="hsl(33, 100%, 57%)" name="Food" />
            <Bar dataKey="profit" fill="hsl(142, 76%, 36%)" name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
