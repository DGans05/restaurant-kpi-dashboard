import { z } from 'zod';

export const userRole = z.enum(['admin', 'manager', 'viewer']);

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(1, 'Full name is required'),
  role: userRole,
  is_active: z.boolean().default(true),
});

export const userUpdateSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').optional(),
  role: userRole.optional(),
  is_active: z.boolean().optional(),
});

export const userWithRestaurantsSchema = userSchema.extend({
  restaurant_ids: z.array(z.string().uuid()).optional(),
});

export type UserInput = z.infer<typeof userSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserWithRestaurants = z.infer<typeof userWithRestaurantsSchema>;
export type UserRole = z.infer<typeof userRole>;
