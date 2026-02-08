'use client'

/**
 * Audit Log Table Component
 *
 * Displays audit logs in a table format.
 */

import { AuditLog } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Activity } from 'lucide-react'

interface AuditLogTableProps {
  logs: AuditLog[]
}

const actionColors = {
  CREATE: 'bg-green-100 text-green-700 border-green-200',
  UPDATE: 'bg-blue-100 text-blue-700 border-blue-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
  LOGIN: 'bg-purple-100 text-purple-700 border-purple-200',
  LOGOUT: 'bg-gray-100 text-gray-700 border-gray-200',
  ACCESS: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No audit logs found</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Resource ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono text-xs">
                {new Date(log.createdAt).toLocaleString()}
              </TableCell>
              <TableCell className="text-sm">
                {log.userEmail || (
                  <span className="text-muted-foreground">System</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={actionColors[log.action] || ''}
                >
                  {log.action}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {log.resourceType}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {log.resourceId ? (
                  log.resourceId.substring(0, 8) + '...'
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
