import { z } from 'zod';

const kpiBase = z.object({
  restaurant_id: z.string().uuid('Invalid restaurant ID'),
  date: z.coerce.date(),
  revenue: z.coerce.number().positive('Revenue must be positive'),
  labour_cost: z.coerce.number().nonnegative('Labour cost cannot be negative'),
  food_cost: z.coerce.number().nonnegative('Food cost cannot be negative'),
  order_count: z.coerce.number().int('Order count must be an integer').nonnegative('Order count cannot be negative'),
});

export const kpiEntrySchema = kpiBase.refine(
  (data) => data.labour_cost + data.food_cost <= data.revenue,
  {
    message: 'Labour cost and food cost combined cannot exceed revenue',
    path: ['revenue'],
  }
);

export const kpiEntryUpdateSchema = kpiBase.partial().refine(
  (data) => {
    if (data.labour_cost !== undefined && data.food_cost !== undefined && data.revenue !== undefined) {
      return data.labour_cost + data.food_cost <= data.revenue;
    }
    return true;
  },
  {
    message: 'Labour cost and food cost combined cannot exceed revenue',
    path: ['revenue'],
  }
);

export type KPIEntryInput = z.infer<typeof kpiEntrySchema>;
export type KPIEntryUpdate = z.infer<typeof kpiEntryUpdateSchema>;

// CSV import schema
export const kpiCSVRowSchema = z.object({
  restaurant_id: z.string().uuid('Invalid restaurant ID'),
  date: z.string(),
  revenue: z.string(),
  labour_cost: z.string(),
  food_cost: z.string(),
  order_count: z.string(),
}).transform((data) => ({
  restaurant_id: data.restaurant_id,
  date: new Date(data.date),
  revenue: parseFloat(data.revenue),
  labour_cost: parseFloat(data.labour_cost),
  food_cost: parseFloat(data.food_cost),
  order_count: parseInt(data.order_count, 10),
})).refine(
  (data) => data.labour_cost + data.food_cost <= data.revenue,
  {
    message: 'Labour cost and food cost combined cannot exceed revenue',
  }
);

export type KPICSVRow = z.infer<typeof kpiCSVRowSchema>;
