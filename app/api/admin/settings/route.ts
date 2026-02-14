/**
 * Admin System Settings API
 *
 * GET /api/admin/settings - List all settings (grouped by category)
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getSystemSettingsRepository } from '@/lib/repositories'

/**
 * GET /api/admin/settings
 * List all system settings grouped by category
 */
export async function GET() {
  try {
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

    return NextResponse.json({
      success: true,
      data: grouped,
    })
  } catch (error) {
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
          error instanceof Error ? error.message : 'Failed to fetch settings',
      },
      { status: 500 }
    )
  }
}
