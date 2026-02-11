/**
 * DELETE /api/admin/users/[id]/restaurants/[restaurantId]
 * Remove a restaurant access row for a user
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getUserManagementRepository } from '@/lib/repositories'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; restaurantId: string }> }
) {
  try {
    await requireAdmin()
    const { id, restaurantId } = await params

    const userRepo = getUserManagementRepository()
    await userRepo.removeRestaurantAccess(id, restaurantId)

    return NextResponse.json({ success: true })
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
          error instanceof Error ? error.message : 'Failed to remove access',
      },
      { status: 500 }
    )
  }
}
