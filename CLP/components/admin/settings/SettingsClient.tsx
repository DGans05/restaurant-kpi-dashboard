'use client'

/**
 * Settings Management Client Component
 *
 * Displays and manages system settings grouped by category.
 */

import { useState } from 'react'
import { SystemSetting } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings as SettingsIcon } from 'lucide-react'
import { SettingsCategory } from './SettingsCategory'

interface SettingsClientProps {
  settings: Record<string, SystemSetting[]>
}

const categoryLabels = {
  general: 'General',
  email: 'Email',
  security: 'Security',
  features: 'Features',
}

const categoryDescriptions = {
  general: 'General system configuration',
  email: 'Email and notification settings',
  security: 'Security and authentication settings',
  features: 'Feature flags and toggles',
}

export function SettingsClient({ settings: initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [activeTab, setActiveTab] = useState(
    Object.keys(initialSettings)[0] || 'general'
  )

  const handleSettingUpdated = (updatedSetting: SystemSetting) => {
    setSettings({
      ...settings,
      [updatedSetting.category]: settings[updatedSetting.category].map((s) =>
        s.id === updatedSetting.id ? updatedSetting : s
      ),
    })
  }

  const categories = Object.keys(settings) as Array<keyof typeof categoryLabels>

  if (categories.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">System Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure system-wide settings
          </p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <SettingsIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No settings found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">System Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure system-wide settings and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {categoryLabels[category]}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{categoryLabels[category]} Settings</CardTitle>
                <CardDescription>
                  {categoryDescriptions[category]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsCategory
                  settings={settings[category]}
                  onSettingUpdated={handleSettingUpdated}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
