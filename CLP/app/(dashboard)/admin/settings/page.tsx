/**
 * Admin Settings Page
 *
 * Server component that fetches system settings and passes to client component.
 */

import { requireAdmin } from '@/lib/auth/require-admin'
import { getSystemSettingsRepository } from '@/lib/repositories'
import { SettingsClient } from '@/components/admin/settings/SettingsClient'

export const metadata = {
  title: 'System Settings',
  description: 'Manage system configuration',
}

export default async function AdminSettingsPage() {
  await requireAdmin()

  const settingsRepo = getSystemSettingsRepository()
  const settings = await settingsRepo.findAll()

  // Group by category
  const grouped = settings.reduce(
    (acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    },
    {} as Record<string, typeof settings>
  )

  return <SettingsClient settings={grouped} />
}
