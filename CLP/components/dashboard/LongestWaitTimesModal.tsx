"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { DeliveryOrder } from "@/lib/types";
import { format, parse } from "date-fns";

interface LongestWaitTimesModalProps {
  orders: DeliveryOrder[];
  month: string;
  trigger: React.ReactNode;
}

export function LongestWaitTimesModal({
  orders,
  month,
  trigger,
}: LongestWaitTimesModalProps) {
  // Format month for display (YYYY-MM → "Feb 2026")
  const formatMonth = (monthStr: string) => {
    try {
      const date = parse(monthStr, "yyyy-MM", new Date());
      return format(date, "MMM yyyy");
    } catch {
      return monthStr;
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="w-full">{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Langste Wachttijden - {formatMonth(month)}</DialogTitle>
          <DialogDescription>
            Top {orders.length} longest delivery times
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No delivery data available for this month
            </p>
          ) : (
            orders.map((order, idx) => (
              <div
                key={order.orderNumber}
                className="flex gap-4 border-b border-border py-3 items-center"
              >
                <span className="font-semibold text-muted-foreground w-8">
                  #{idx + 1}
                </span>
                <span className="font-bold text-red-500 w-16">
                  {order.waitingTimeMins} min
                </span>
                <span className="flex-1 text-sm font-medium">
                  {order.phoneNumber}
                </span>
                <span className="text-xs text-muted-foreground">
                  {order.orderNumber}
                </span>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
