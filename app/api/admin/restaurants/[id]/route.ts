/**
 * Admin Restaurant Management API - Individual Restaurant
 *
 * PATCH  /api/admin/restaurants/[id] - Update restaurant
 * DELETE /api/admin/restaurants/[id] - Soft delete restaurant
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getRestaurantManagementRepository } from '@/lib/repositories'
import { UpdateRestaurantDtoSchema } from '@/lib/schemas'
import { z } from 'zod'

/**
 * PATCH /api/admin/restaurants/[id]
 * Update restaurant details
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const body = await request.json()
    const validated = UpdateRestaurantDtoSchema.parse(body)

    const restaurantRepo = getRestaurantManagementRepository()
    const restaurant = await restaurantRepo.update(id, validated)

    return NextResponse.json({
      success: true,
      data: restaurant,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid restaurant data',
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
          error instanceof Error ? error.message : 'Failed to update restaurant',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/restaurants/[id]
 * Soft delete restaurant
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const restaurantRepo = getRestaurantManagementRepository()
    await restaurantRepo.softDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Restaurant deleted successfully',
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
          error instanceof Error ? error.message : 'Failed to delete restaurant',
      },
      { status: 500 }
    )
  }
}
