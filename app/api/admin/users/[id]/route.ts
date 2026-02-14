/**
 * Admin User Management API - Individual User
 *
 * GET    /api/admin/users/[id] - Get user by ID
 * PATCH  /api/admin/users/[id] - Update user profile
 * DELETE /api/admin/users/[id] - Soft delete user
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getUserManagementRepository } from '@/lib/repositories'
import { UpdateUserProfileDtoSchema } from '@/lib/schemas'
import { z } from 'zod'

/**
 * GET /api/admin/users/[id]
 * Get user by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const userRepo = getUserManagementRepository()
    const user = await userRepo.findUserById(id)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
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
        error: error instanceof Error ? error.message : 'Failed to fetch user',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user profile
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const body = await request.json()
    const validated = UpdateUserProfileDtoSchema.parse(body)

    const userRepo = getUserManagementRepository()
    const user = await userRepo.updateUserProfile(id, validated)

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user data',
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
        error: error instanceof Error ? error.message : 'Failed to update user',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Soft delete user
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const userRepo = getUserManagementRepository()
    await userRepo.deleteUser(id)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
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
        error: error instanceof Error ? error.message : 'Failed to delete user',
      },
      { status: 500 }
    )
  }
}
