/**
 * Admin Audit Logs Page
 *
 * Server component that fetches audit logs and passes to client component.
 */

import { requireAdmin } from '@/lib/auth/require-admin'
import { getAuditLogRepository } from '@/lib/repositories'
import { AuditLogsClient } from '@/components/admin/audit/AuditLogsClient'

export const metadata = {
  title: 'Audit Logs',
  description: 'View system activity logs',
}

export default async function AdminAuditLogsPage() {
  await requireAdmin()

  const auditRepo = getAuditLogRepository()
  const logs = await auditRepo.findRecent(100)

  return <AuditLogsClient logs={logs} />
}
