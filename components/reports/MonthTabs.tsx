'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const MONTHS = [
  { label: 'Jan', value: 1 },
  { label: 'Feb', value: 2 },
  { label: 'Mar', value: 3 },
  { label: 'Apr', value: 4 },
  { label: 'May', value: 5 },
  { label: 'Jun', value: 6 },
  { label: 'Jul', value: 7 },
  { label: 'Aug', value: 8 },
  { label: 'Sep', value: 9 },
  { label: 'Oct', value: 10 },
  { label: 'Nov', value: 11 },
  { label: 'Dec', value: 12 },
];

interface MonthTabsProps {
  currentMonth: number;
}

export function MonthTabs({ currentMonth }: MonthTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMonthChange = (month: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('month', String(month));
    router.push(`/reports?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {MONTHS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => handleMonthChange(value)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
            currentMonth === value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
