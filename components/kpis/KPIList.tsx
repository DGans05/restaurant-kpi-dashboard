'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface KPIEntry {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  date: string;
  revenue: number;
  labour_cost: number;
  food_cost: number;
  order_count: number;
}

interface KPIListProps {
  entries: KPIEntry[];
  isLoading?: boolean;
  onDelete?: (id: string) => Promise<void>;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
}

type SortField = 'date' | 'revenue' | 'labour_cost' | 'food_cost';

export function KPIList({ entries, isLoading = false, onDelete, onSort }: KPIListProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    const newDirection = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortDirection(newDirection);
    onSort?.(field, newDirection);
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;

    try {
      setDeleteId(id);
      await onDelete(id);
    } finally {
      setDeleteId(null);
    }
  };

  const calculatePercent = (cost: number, revenue: number) => {
    return revenue > 0 ? ((cost / revenue) * 100).toFixed(2) : '0.00';
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="font-semibold hover:text-primary transition-colors flex items-center gap-1"
    >
      {label}
      {sortField === field && (
        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
      )}
    </button>
  );

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">No KPI entries found</p>
            <p className="text-sm">
              <Link href="/dashboard/kpis/new" className="text-primary hover:underline">
                Create your first entry
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI Entries</CardTitle>
        <CardDescription>View and manage all KPI entries</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Restaurant</th>
                <th className="text-left py-3 px-4">
                  <SortHeader field="date" label="Date" />
                </th>
                <th className="text-right py-3 px-4">
                  <SortHeader field="revenue" label="Revenue" />
                </th>
                <th className="text-right py-3 px-4">
                  <SortHeader field="labour_cost" label="Labour" />
                </th>
                <th className="text-right py-3 px-4">
                  <SortHeader field="food_cost" label="Food" />
                </th>
                <th className="text-right py-3 px-4">Orders</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4">{entry.restaurant_name || entry.restaurant_id}</td>
                  <td className="py-3 px-4">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    ${entry.revenue.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    ${entry.labour_cost.toFixed(2)}{' '}
                    <span className="text-xs text-muted-foreground">
                      ({calculatePercent(entry.labour_cost, entry.revenue)}%)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    ${entry.food_cost.toFixed(2)}{' '}
                    <span className="text-xs text-muted-foreground">
                      ({calculatePercent(entry.food_cost, entry.revenue)}%)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">{entry.order_count}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/dashboard/kpis/${entry.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isLoading}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading || deleteId === entry.id}
                        onClick={() => handleDelete(entry.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        {deleteId === entry.id ? (
                          <span className="h-4 w-4">...</span>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
