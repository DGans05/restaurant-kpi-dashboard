/**
 * Admin Restaurants Page
 *
 * Server component that fetches restaurants and passes to client component.
 */

import { requireAdmin } from '@/lib/auth/require-admin'
import { getRestaurantManagementRepository } from '@/lib/repositories'
import { RestaurantsClient } from '@/components/admin/restaurants/RestaurantsClient'

export const metadata = {
  title: 'Restaurant Management',
  description: 'Manage restaurants',
}

export default async function AdminRestaurantsPage() {
  await requireAdmin()

  const restaurantRepo = getRestaurantManagementRepository()
  const restaurants = await restaurantRepo.findAll()

  return <RestaurantsClient restaurants={restaurants} />
}
