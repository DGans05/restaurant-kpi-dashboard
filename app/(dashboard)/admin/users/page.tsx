/**
 * Admin Users Page
 *
 * Server component that fetches initial data and passes to client component.
 */

import { requireAdmin } from '@/lib/auth/require-admin'
import {
  getUserManagementRepository,
  getRestaurantRepository,
} from '@/lib/repositories'
import { UsersClient } from '@/components/admin/users/UsersClient'

export const metadata = {
  title: 'User Management',
  description: 'Manage user accounts and permissions',
}

export default async function AdminUsersPage() {
  await requireAdmin()

  const [users, restaurants] = await Promise.all([
    getUserManagementRepository().findAllUsers(),
    getRestaurantRepository().findAll(),
  ])

  return <UsersClient users={users} restaurants={restaurants} />
}
