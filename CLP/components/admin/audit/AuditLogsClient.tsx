'use client'

/**
 * Audit Logs Client Component
 *
 * Displays system audit logs with filtering.
 */

import { useState } from 'react'
import { AuditLog } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { AuditLogTable } from './AuditLogTable'
import { AuditLogFilters } from './AuditLogFilters'

interface AuditLogsClientProps {
  logs: AuditLog[]
}

export function AuditLogsClient({ logs: initialLogs }: AuditLogsClientProps) {
  const [logs] = useState<AuditLog[]>(initialLogs)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [resourceFilter, setResourceFilter] = useState<string>('all')

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      log.userEmail?.toLowerCase().includes(query) ||
      log.resourceType.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query)

    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    const matchesResource =
      resourceFilter === 'all' || log.resourceType === resourceFilter

    return matchesSearch && matchesAction && matchesResource
  })

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)))
  const uniqueResources = Array.from(new Set(logs.map((log) => log.resourceType)))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Audit Logs</h2>
        <p className="text-sm text-muted-foreground">
          View complete system activity trail
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by user, resource, or action..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <AuditLogFilters
        actionFilter={actionFilter}
        resourceFilter={resourceFilter}
        onActionFilterChange={setActionFilter}
        onResourceFilterChange={setResourceFilter}
        actions={uniqueActions}
        resources={uniqueResources}
      />

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredLogs.length} of {logs.length} log entries
      </div>

      {/* Audit Log Table */}
      <AuditLogTable logs={filteredLogs} />
    </div>
  )
}
