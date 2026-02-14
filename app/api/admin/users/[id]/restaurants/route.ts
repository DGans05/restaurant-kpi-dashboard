/**
 * Admin User Restaurant Access API
 *
 * GET  /api/admin/users/[id]/restaurants - List all restaurant access for a user
 * POST /api/admin/users/[id]/restaurants - Assign restaurant access
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getUserManagementRepository } from '@/lib/repositories'
import { z } from 'zod'

const AssignSchema = z.object({
  restaurantId: z.string().min(1),
  role: z.enum(['owner', 'manager', 'viewer']).default('viewer'),
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const userRepo = getUserManagementRepository()
    const access = await userRepo.getRestaurantAccessForUser(id)

    return NextResponse.json({ success: true, data: access })
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
          error instanceof Error ? error.message : 'Failed to fetch access',
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const body = await request.json()
    const { restaurantId, role } = AssignSchema.parse(body)

    const userRepo = getUserManagementRepository()
    const profile = await userRepo.assignRestaurantAccess(id, restaurantId, role)

    return NextResponse.json({ success: true, data: profile }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data' },
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
          error instanceof Error ? error.message : 'Failed to assign access',
      },
      { status: 500 }
    )
  }
}
