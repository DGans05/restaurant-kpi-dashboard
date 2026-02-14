/**
 * Admin Repository Interfaces
 *
 * Provides interfaces for admin-only operations:
 * - User management
 * - Restaurant management (with soft deletes)
 * - Audit logs
 * - System settings
 */

import {
  UserProfile,
  CreateUserProfileDto,
  UpdateUserProfileDto,
  Restaurant,
  CreateRestaurantDto,
  UpdateRestaurantDto,
  AuditLog,
  AuditLogFilters,
  SystemSetting,
  UserRole,
} from '@/lib/types'

/**
 * User Management Repository
 *
 * Handles CRUD operations for users and their profiles.
 * All operations require admin privileges.
 */
export interface UserManagementRepository {
  /**
   * Find all users (including soft-deleted ones)
   */
  findAllUsers(includeDeleted?: boolean): Promise<UserProfile[]>

  /**
   * Find user by ID
   */
  findUserById(userId: string): Promise<UserProfile | null>

  /**
   * Find all users associated with a restaurant
   */
  findUsersByRestaurant(restaurantId: string): Promise<UserProfile[]>

  /**
   * Create a new user with Supabase Auth + profile
   *
   * @param email User email address
   * @param password Initial password
   * @param profile Profile data (restaurant, role, etc.)
   * @returns Created user profile
   */
  createUserWithProfile(
    email: string,
    password: string,
    profile: CreateUserProfileDto
  ): Promise<UserProfile>

  /**
   * Update user profile
   */
  updateUserProfile(
    id: string,
    updates: UpdateUserProfileDto
  ): Promise<UserProfile>

  /**
   * Soft delete a user
   */
  deleteUser(userId: string): Promise<void>

  /**
   * Restore a soft-deleted user
   */
  restoreUser(userId: string): Promise<void>

  /**
   * Get all restaurant access rows for a single user
   */
  getRestaurantAccessForUser(userId: string): Promise<UserProfile[]>

  /**
   * Assign restaurant access to a user (upsert — adds if not present)
   */
  assignRestaurantAccess(
    userId: string,
    restaurantId: string,
    role: UserRole
  ): Promise<UserProfile>

  /**
   * Remove restaurant access from a user
   */
  removeRestaurantAccess(
    userId: string,
    restaurantId: string
  ): Promise<void>
}

/**
 * Restaurant Management Repository
 *
 * Handles CRUD operations for restaurants with soft delete support.
 */
export interface RestaurantManagementRepository {
  /**
   * Find all restaurants (optionally include deleted ones)
   */
  findAll(includeDeleted?: boolean): Promise<Restaurant[]>

  /**
   * Create a new restaurant
   */
  create(data: CreateRestaurantDto): Promise<Restaurant>

  /**
   * Update restaurant details
   */
  update(id: string, data: UpdateRestaurantDto): Promise<Restaurant>

  /**
   * Soft delete a restaurant
   */
  softDelete(id: string): Promise<void>

  /**
   * Restore a soft-deleted restaurant
   */
  restore(id: string): Promise<void>
}

/**
 * Audit Log Repository
 *
 * Provides read-only access to audit logs.
 * Logs are created automatically via database triggers.
 */
export interface AuditLogRepository {
  /**
   * Find all audit logs with optional filters
   */
  findAll(filters?: AuditLogFilters): Promise<AuditLog[]>

  /**
   * Find audit logs for a specific user
   */
  findByUser(userId: string, limit?: number): Promise<AuditLog[]>

  /**
   * Find audit logs for a specific resource
   */
  findByResource(
    resourceType: string,
    resourceId: string
  ): Promise<AuditLog[]>

  /**
   * Find recent audit logs (last N entries)
   */
  findRecent(limit?: number): Promise<AuditLog[]>
}

/**
 * System Settings Repository
 *
 * Manages system-wide configuration settings.
 */
export interface SystemSettingsRepository {
  /**
   * Find all system settings
   */
  findAll(): Promise<SystemSetting[]>

  /**
   * Find setting by key
   */
  findByKey(key: string): Promise<SystemSetting | null>

  /**
   * Find all settings in a category
   */
  findByCategory(
    category: 'general' | 'email' | 'security' | 'features'
  ): Promise<SystemSetting[]>

  /**
   * Create or update a system setting
   */
  upsert(
    key: string,
    value: unknown,
    category: 'general' | 'email' | 'security' | 'features',
    description?: string | null
  ): Promise<SystemSetting>

  /**
   * Delete a system setting
   */
  delete(key: string): Promise<void>
}
