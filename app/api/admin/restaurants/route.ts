/**
 * Admin Restaurant Management API
 *
 * GET  /api/admin/restaurants - List all restaurants
 * POST /api/admin/restaurants - Create new restaurant
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getRestaurantManagementRepository } from '@/lib/repositories'
import { CreateRestaurantDtoSchema } from '@/lib/schemas'
import { z } from 'zod'

/**
 * GET /api/admin/restaurants
 * List all restaurants (with optional includeDeleted param)
 */
export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const includeDeleted = searchParams.get('includeDeleted') === 'true'

    const restaurantRepo = getRestaurantManagementRepository()
    const restaurants = await restaurantRepo.findAll(includeDeleted)

    return NextResponse.json({
      success: true,
      data: restaurants,
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
          error instanceof Error ? error.message : 'Failed to fetch restaurants',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/restaurants
 * Create a new restaurant
 */
export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const validated = CreateRestaurantDtoSchema.parse(body)

    const restaurantRepo = getRestaurantManagementRepository()
    const restaurant = await restaurantRepo.create(validated)

    return NextResponse.json(
      {
        success: true,
        data: restaurant,
      },
      { status: 201 }
    )
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
          error instanceof Error ? error.message : 'Failed to create restaurant',
      },
      { status: 500 }
    )
  }
}
