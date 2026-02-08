/**
 * Admin Audit Logs API
 *
 * GET /api/admin/audit-logs - List audit logs with filters
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getAuditLogRepository } from '@/lib/repositories'
import { AuditLogFiltersSchema } from '@/lib/schemas'
import { z } from 'zod'

/**
 * GET /api/admin/audit-logs
 * List audit logs with optional filters
 *
 * Query params:
 * - userId (string): Filter by user ID
 * - resourceType (string): Filter by resource type
 * - action (string): Filter by action
 * - startDate (ISO string): Filter by start date
 * - endDate (ISO string): Filter by end date
 * - limit (number): Limit results (default 100, max 1000)
 * - offset (number): Offset for pagination
 */
export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)

    // Build filters from query params
    const filters = {
      userId: searchParams.get('userId') || undefined,
      resourceType: searchParams.get('resourceType') || undefined,
      action: searchParams.get('action') || undefined,
      startDate: searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : undefined,
      endDate: searchParams.get('endDate')
        ? new Date(searchParams.get('endDate')!)
        : undefined,
      limit: searchParams.get('limit')
        ? Number(searchParams.get('limit'))
        : 100,
      offset: searchParams.get('offset')
        ? Number(searchParams.get('offset'))
        : 0,
    }

    // Validate filters
    const validated = AuditLogFiltersSchema.parse(filters)

    const auditRepo = getAuditLogRepository()
    const logs = await auditRepo.findAll(validated)

    return NextResponse.json({
      success: true,
      data: logs,
      meta: {
        limit: validated.limit,
        offset: validated.offset,
        count: logs.length,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid filter parameters',
        },
        { status: 400 }
      )
    }

    if (
      error instanceof Error &&
      (error.message.includes('Unauthorized') ||
        error.message.includes('Forbidden'))
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch audit logs',
      },
      { status: 500 }
    )
  }
}
