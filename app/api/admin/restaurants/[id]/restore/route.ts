/**
 * Admin Restaurant Management API - Restore
 *
 * POST /api/admin/restaurants/[id]/restore - Restore soft-deleted restaurant
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getRestaurantManagementRepository } from '@/lib/repositories'

/**
 * POST /api/admin/restaurants/[id]/restore
 * Restore a soft-deleted restaurant
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const restaurantRepo = getRestaurantManagementRepository()
    await restaurantRepo.restore(id)

    return NextResponse.json({
      success: true,
      message: 'Restaurant restored successfully',
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
          error instanceof Error ? error.message : 'Failed to restore restaurant',
      },
      { status: 500 }
    )
  }
}
