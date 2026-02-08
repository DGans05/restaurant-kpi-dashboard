/**
 * Admin User Management API
 *
 * GET  /api/admin/users - List all users
 * POST /api/admin/users - Create new user
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getUserManagementRepository } from '@/lib/repositories'
import { CreateUserProfileDtoSchema } from '@/lib/schemas'
import { z } from 'zod'

const CreateUserRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  profile: CreateUserProfileDtoSchema,
})

/**
 * GET /api/admin/users
 * List all users (with optional includeDeleted param)
 */
export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const includeDeleted = searchParams.get('includeDeleted') === 'true'

    const userRepo = getUserManagementRepository()
    const users = await userRepo.findAllUsers(includeDeleted)

    return NextResponse.json({
      success: true,
      data: users,
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
        error: error instanceof Error ? error.message : 'Failed to fetch users',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/users
 * Create a new user with profile
 */
export async function POST(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const validated = CreateUserRequestSchema.parse(body)

    const userRepo = getUserManagementRepository()
    const user = await userRepo.createUserWithProfile(
      validated.email,
      validated.password,
      validated.profile
    )

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 }
    )
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
        error: error instanceof Error ? error.message : 'Failed to create user',
      },
      { status: 500 }
    )
  }
}
