'use client'

/**
 * Audit Log Filters Component
 *
 * Filter controls for audit logs.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface AuditLogFiltersProps {
  actionFilter: string
  resourceFilter: string
  onActionFilterChange: (value: string) => void
  onResourceFilterChange: (value: string) => void
  actions: string[]
  resources: string[]
}

export function AuditLogFilters({
  actionFilter,
  resourceFilter,
  onActionFilterChange,
  onResourceFilterChange,
  actions,
  resources,
}: AuditLogFiltersProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Label htmlFor="action-filter" className="text-sm">
          Action
        </Label>
        <Select value={actionFilter} onValueChange={onActionFilterChange}>
          <SelectTrigger id="action-filter">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {actions.map((action) => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label htmlFor="resource-filter" className="text-sm">
          Resource
        </Label>
        <Select value={resourceFilter} onValueChange={onResourceFilterChange}>
          <SelectTrigger id="resource-filter">
            <SelectValue placeholder="All resources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All resources</SelectItem>
            {resources.map((resource) => (
              <SelectItem key={resource} value={resource}>
                {resource}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
