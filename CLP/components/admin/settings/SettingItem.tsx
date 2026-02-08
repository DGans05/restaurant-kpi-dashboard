'use client'

/**
 * Setting Item Component
 *
 * Displays and edits an individual system setting.
 */

import { useState } from 'react'
import { SystemSetting } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Check, X, Edit } from 'lucide-react'

interface SettingItemProps {
  setting: SystemSetting
  onUpdated: (setting: SystemSetting) => void
}

export function SettingItem({ setting, onUpdated }: SettingItemProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(setting.value))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    try {
      // Parse value based on current type
      let parsedValue: unknown = value

      if (typeof setting.value === 'boolean') {
        parsedValue = value === 'true'
      } else if (typeof setting.value === 'number') {
        parsedValue = Number(value)
      }

      const response = await fetch(`/api/admin/settings/${setting.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: setting.key,
          value: parsedValue,
          category: setting.category,
          description: setting.description,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update setting')
      }

      const { data } = await response.json()
      onUpdated(data)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setValue(String(setting.value))
    setEditing(false)
    setError(null)
  }

  const renderValue = () => {
    if (typeof setting.value === 'boolean') {
      return editing ? (
        <Switch
          checked={value === 'true'}
          onCheckedChange={(checked) => setValue(String(checked))}
        />
      ) : (
        <span
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
            setting.value
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {setting.value ? 'Enabled' : 'Disabled'}
        </span>
      )
    }

    return editing ? (
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type={typeof setting.value === 'number' ? 'number' : 'text'}
        className="max-w-xs"
      />
    ) : (
      <span className="font-mono text-sm">{String(setting.value)}</span>
    )
  }

  return (
    <div className="flex items-start justify-between py-4 border-b last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <Label className="text-sm font-medium">{setting.key}</Label>
        {setting.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {setting.description}
          </p>
        )}
        <div className="mt-2">{renderValue()}</div>
        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </div>

      <div className="flex gap-2">
        {editing ? (
          <>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={loading}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditing(true)}
          >
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
