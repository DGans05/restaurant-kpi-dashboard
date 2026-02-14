/**
 * Admin System Settings API - Individual Setting
 *
 * GET /api/admin/settings/[key] - Get setting by key
 * PUT /api/admin/settings/[key] - Update setting value
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getSystemSettingsRepository } from '@/lib/repositories'
import { UpsertSystemSettingSchema } from '@/lib/schemas'
import { z } from 'zod'

/**
 * GET /api/admin/settings/[key]
 * Get setting by key
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await requireAdmin()
    const { key } = await params

    const settingsRepo = getSystemSettingsRepository()
    const setting = await settingsRepo.findByKey(key)

    if (!setting) {
      return NextResponse.json(
        { success: false, error: 'Setting not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: setting,
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
          error instanceof Error ? error.message : 'Failed to fetch setting',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/settings/[key]
 * Update or create setting
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await requireAdmin()
    const { key } = await params

    const body = await request.json()
    const validated = UpsertSystemSettingSchema.parse(body)

    // Ensure key in path matches key in body
    if (validated.key !== key) {
      return NextResponse.json(
        { success: false, error: 'Key mismatch' },
        { status: 400 }
      )
    }

    const settingsRepo = getSystemSettingsRepository()
    const setting = await settingsRepo.upsert(
      validated.key,
      validated.value,
      validated.category,
      validated.description
    )

    return NextResponse.json({
      success: true,
      data: setting,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid setting data',
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
          error instanceof Error ? error.message : 'Failed to update setting',
      },
      { status: 500 }
    )
  }
}
