import { z } from 'zod';

export const restaurantSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required').max(255),
  location: z.string().max(255).optional(),
  timezone: z.string().default('UTC'),
  is_active: z.boolean().default(true),
});

export const restaurantUpdateSchema = restaurantSchema.partial();

export type RestaurantInput = z.infer<typeof restaurantSchema>;
export type RestaurantUpdate = z.infer<typeof restaurantUpdateSchema>;
