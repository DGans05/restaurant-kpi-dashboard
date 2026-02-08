/**
 * Admin Authorization Helper
 *
 * Provides server-side authorization checks for admin-only routes and operations.
 * Throws an error if the current user is not an admin.
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Verify that the current user is an admin
 *
 * @throws {Error} If user is not authenticated or not an admin
 * @returns {Promise<{ userId: string; userEmail: string }>} User info if admin
 */
export async function requireAdmin(): Promise<{
  userId: string
  userEmail: string
}> {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required')
  }

  // Check if user is an admin
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('is_admin, deleted_at')
    .eq('user_id', user.id)
    .single()

  if (profileError) {
    throw new Error('Failed to verify admin status')
  }

  if (!profile) {
    throw new Error('User profile not found')
  }

  if (profile.deleted_at) {
    throw new Error('User account is deactivated')
  }

  if (!profile.is_admin) {
    throw new Error('Forbidden: Admin access required')
  }

  return {
    userId: user.id,
    userEmail: user.email || '',
  }
}

/**
 * Check if the current user is an admin (non-throwing version)
 *
 * @returns {Promise<boolean>} True if user is an admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    await requireAdmin()
    return true
  } catch {
    return false
  }
}
