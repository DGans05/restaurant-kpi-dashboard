'use client'

/**
 * Settings Category Component
 *
 * Displays and edits settings within a category.
 */

import { SystemSetting } from '@/lib/types'
import { SettingItem } from './SettingItem'

interface SettingsCategoryProps {
  settings: SystemSetting[]
  onSettingUpdated: (setting: SystemSetting) => void
}

export function SettingsCategory({
  settings,
  onSettingUpdated,
}: SettingsCategoryProps) {
  if (settings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No settings in this category
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {settings.map((setting) => (
        <SettingItem
          key={setting.id}
          setting={setting}
          onUpdated={onSettingUpdated}
        />
      ))}
    </div>
  )
}
