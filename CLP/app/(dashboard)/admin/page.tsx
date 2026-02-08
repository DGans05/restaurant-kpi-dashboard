/**
 * Admin Dashboard Overview
 *
 * Shows summary statistics and quick links to admin sections.
 */

import { requireAdmin } from '@/lib/auth/require-admin'
import {
  getUserManagementRepository,
  getRestaurantManagementRepository,
  getAuditLogRepository,
} from '@/lib/repositories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Activity, Settings } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  await requireAdmin()

  // Fetch summary data
  const [users, restaurants, recentLogs] = await Promise.all([
    getUserManagementRepository().findAllUsers(),
    getRestaurantManagementRepository().findAll(),
    getAuditLogRepository().findRecent(10),
  ])

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      href: '/admin/users',
    },
    {
      title: 'Total Restaurants',
      value: restaurants.length,
      icon: Building2,
      href: '/admin/restaurants',
    },
    {
      title: 'Recent Activity',
      value: recentLogs.length,
      icon: Activity,
      href: '/admin/audit',
    },
    {
      title: 'System Settings',
      value: '—',
      icon: Settings,
      href: '/admin/settings',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.href} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {log.action} on {log.resourceType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.userEmail || 'System'} •{' '}
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Create, edit, and manage user accounts and permissions
            </p>
            <Link
              href="/admin/users"
              className="text-sm font-medium text-primary hover:underline"
            >
              Manage Users →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Restaurant Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Add, edit, and remove restaurants from the system
            </p>
            <Link
              href="/admin/restaurants"
              className="text-sm font-medium text-primary hover:underline"
            >
              Manage Restaurants →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Configure system-wide settings and preferences
            </p>
            <Link
              href="/admin/settings"
              className="text-sm font-medium text-primary hover:underline"
            >
              View Settings →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              View complete audit trail of all system changes
            </p>
            <Link
              href="/admin/audit"
              className="text-sm font-medium text-primary hover:underline"
            >
              View Audit Logs →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
