/**
 * Admin Layout
 *
 * Protects all admin routes with server-side authentication check.
 * Only admins (is_admin = true) can access this section.
 */

import { requireAdmin } from '@/lib/auth/require-admin'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Admin Dashboard',
  description: 'System administration and management',
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  // Server-side guard: throws if not admin
  await requireAdmin()

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage users, restaurants, and system settings
        </p>
      </div>
      {children}
    </div>
  )
}
