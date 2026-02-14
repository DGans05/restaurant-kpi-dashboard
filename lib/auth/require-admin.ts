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

  // Check if user has an active admin profile (supports multi-restaurant users)
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .eq('is_admin', true)
    .is('deleted_at', null)
    .limit(1)

  if (profileError) {
    throw new Error('Failed to verify admin status')
  }

  if (!profiles || profiles.length === 0) {
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
