/**
 * Supabase Admin Repository Implementations
 *
 * All admin repositories use the admin client (service role) to bypass RLS.
 * Each mutation operation logs to the audit_logs table automatically via triggers.
 */

import { createAdminClient } from '@/lib/supabase/admin-client'
import {
  UserManagementRepository,
  RestaurantManagementRepository,
  AuditLogRepository,
  SystemSettingsRepository,
} from './admin-repository'
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
 * Supabase User Management Repository
 */
export class SupabaseUserManagementRepository
  implements UserManagementRepository
{
  private supabase = createAdminClient()

  async findAllUsers(includeDeleted = false): Promise<UserProfile[]> {
    let query = this.supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!includeDeleted) {
      query = query.is('deleted_at', null)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    return (data || []).map(this.mapUserProfile)
  }

  async findUserById(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch user: ${error.message}`)
    }

    return this.mapUserProfile(data)
  }

  async findUsersByRestaurant(restaurantId: string): Promise<UserProfile[]> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    return (data || []).map(this.mapUserProfile)
  }

  async createUserWithProfile(
    email: string,
    password: string,
    profile: CreateUserProfileDto
  ): Promise<UserProfile> {
    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await this.supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
      })

    if (authError || !authData.user) {
      throw new Error(`Failed to create user: ${authError?.message || 'Unknown error'}`)
    }

    // Create user profile
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        restaurant_id: profile.restaurantId,
        role: profile.role,
        display_name: profile.displayName,
        is_admin: profile.isAdmin || false,
      })
      .select()
      .single()

    if (error) {
      // Rollback: Delete auth user if profile creation fails
      await this.supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Failed to create user profile: ${error.message}`)
    }

    return this.mapUserProfile(data)
  }

  async updateUserProfile(
    id: string,
    updates: UpdateUserProfileDto
  ): Promise<UserProfile> {
    const updateData: Record<string, unknown> = {}

    if (updates.role !== undefined) {
      updateData.role = updates.role
    }
    if (updates.displayName !== undefined) {
      updateData.display_name = updates.displayName
    }
    if (updates.isAdmin !== undefined) {
      updateData.is_admin = updates.isAdmin
    }
    if (updates.restaurantId !== undefined) {
      updateData.restaurant_id = updates.restaurantId
    }

    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`)
    }

    return this.mapUserProfile(data)
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }

  async restoreUser(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_profiles')
      .update({ deleted_at: null })
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to restore user: ${error.message}`)
    }
  }

  async getRestaurantAccessForUser(userId: string): Promise<UserProfile[]> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch restaurant access: ${error.message}`)
    }

    return (data || []).map(this.mapUserProfile)
  }

  async assignRestaurantAccess(
    userId: string,
    restaurantId: string,
    role: UserRole
  ): Promise<UserProfile> {
    // Get display_name and is_admin from an existing profile row for this user
    const { data: existing } = await this.supabase
      .from('user_profiles')
      .select('display_name, is_admin')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .limit(1)
      .single()

    const { data, error } = await this.supabase
      .from('user_profiles')
      .upsert(
        {
          user_id: userId,
          restaurant_id: restaurantId,
          role,
          display_name: existing?.display_name ?? null,
          is_admin: existing?.is_admin ?? false,
          deleted_at: null,
        },
        { onConflict: 'user_id,restaurant_id', ignoreDuplicates: false }
      )
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to assign restaurant access: ${error.message}`)
    }

    return this.mapUserProfile(data)
  }

  async removeRestaurantAccess(
    userId: string,
    restaurantId: string
  ): Promise<void> {
    // Soft delete the profile
    const { error } = await this.supabase
      .from('user_profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId)

    if (error) {
      throw new Error(`Failed to remove restaurant access: ${error.message}`)
    }
  }

  private mapUserProfile(data: Record<string, unknown>): UserProfile {
    return {
      id: String(data.id),
      userId: String(data.user_id),
      restaurantId: String(data.restaurant_id),
      role: String(data.role) as UserRole,
      displayName: data.display_name ? String(data.display_name) : null,
      isAdmin: Boolean(data.is_admin),
      deletedAt: data.deleted_at ? new Date(String(data.deleted_at)) : null,
      createdAt: new Date(String(data.created_at)),
      updatedAt: new Date(String(data.updated_at)),
    }
  }
}

/**
 * Supabase Restaurant Management Repository
 */
export class SupabaseRestaurantManagementRepository
  implements RestaurantManagementRepository
{
  private supabase = createAdminClient()

  async findAll(includeDeleted = false): Promise<Restaurant[]> {
    let query = this.supabase
      .from('restaurants')
      .select('*')
      .order('name', { ascending: true })

    if (!includeDeleted) {
      query = query.is('deleted_at', null)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch restaurants: ${error.message}`)
    }

    return (data || []).map(this.mapRestaurant)
  }

  async create(createData: CreateRestaurantDto): Promise<Restaurant> {
    const { data, error } = await this.supabase
      .from('restaurants')
      .insert({ name: createData.name })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create restaurant: ${error.message}`)
    }

    return this.mapRestaurant(data)
  }

  async update(
    id: string,
    updateData: UpdateRestaurantDto
  ): Promise<Restaurant> {
    const updates: Record<string, unknown> = {}

    if (updateData.name !== undefined) {
      updates.name = updateData.name
    }

    const { data, error } = await this.supabase
      .from('restaurants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update restaurant: ${error.message}`)
    }

    return this.mapRestaurant(data)
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('restaurants')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete restaurant: ${error.message}`)
    }
  }

  async restore(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('restaurants')
      .update({ deleted_at: null })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to restore restaurant: ${error.message}`)
    }
  }

  private mapRestaurant(data: Record<string, unknown>): Restaurant {
    return {
      id: String(data.id),
      name: String(data.name),
      createdAt: data.created_at ? new Date(String(data.created_at)) : undefined,
      updatedAt: data.updated_at ? new Date(String(data.updated_at)) : undefined,
    }
  }
}

/**
 * Supabase Audit Log Repository
 */
export class SupabaseAuditLogRepository implements AuditLogRepository {
  private supabase = createAdminClient()

  async findAll(filters?: AuditLogFilters): Promise<AuditLog[]> {
    let query = this.supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }
    if (filters?.resourceType) {
      query = query.eq('resource_type', filters.resourceType)
    }
    if (filters?.action) {
      query = query.eq('action', filters.action)
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString())
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString())
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 100) - 1
      )
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`)
    }

    return (data || []).map(this.mapAuditLog)
  }

  async findByUser(userId: string, limit = 100): Promise<AuditLog[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`)
    }

    return (data || []).map(this.mapAuditLog)
  }

  async findByResource(
    resourceType: string,
    resourceId: string
  ): Promise<AuditLog[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`)
    }

    return (data || []).map(this.mapAuditLog)
  }

  async findRecent(limit = 50): Promise<AuditLog[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`)
    }

    return (data || []).map(this.mapAuditLog)
  }

  private mapAuditLog(data: Record<string, unknown>): AuditLog {
    return {
      id: String(data.id),
      userId: data.user_id ? String(data.user_id) : null,
      userEmail: data.user_email ? String(data.user_email) : null,
      action: String(data.action) as AuditLog['action'],
      resourceType: String(data.resource_type),
      resourceId: data.resource_id ? String(data.resource_id) : null,
      oldValues: data.old_values as Record<string, unknown> | null,
      newValues: data.new_values as Record<string, unknown> | null,
      ipAddress: data.ip_address ? String(data.ip_address) : null,
      userAgent: data.user_agent ? String(data.user_agent) : null,
      createdAt: new Date(String(data.created_at)),
    }
  }
}

/**
 * Supabase System Settings Repository
 */
export class SupabaseSystemSettingsRepository
  implements SystemSettingsRepository
{
  private supabase = createAdminClient()

  async findAll(): Promise<SystemSetting[]> {
    const { data, error } = await this.supabase
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch system settings: ${error.message}`)
    }

    return (data || []).map(this.mapSystemSetting)
  }

  async findByKey(key: string): Promise<SystemSetting | null> {
    const { data, error } = await this.supabase
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch system setting: ${error.message}`)
    }

    return this.mapSystemSetting(data)
  }

  async findByCategory(
    category: 'general' | 'email' | 'security' | 'features'
  ): Promise<SystemSetting[]> {
    const { data, error } = await this.supabase
      .from('system_settings')
      .select('*')
      .eq('category', category)
      .order('key', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch system settings: ${error.message}`)
    }

    return (data || []).map(this.mapSystemSetting)
  }

  async upsert(
    key: string,
    value: unknown,
    category: 'general' | 'email' | 'security' | 'features',
    description?: string | null
  ): Promise<SystemSetting> {
    const { data, error } = await this.supabase
      .from('system_settings')
      .upsert(
        {
          key,
          value,
          category,
          description: description || null,
        },
        { onConflict: 'key' }
      )
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upsert system setting: ${error.message}`)
    }

    return this.mapSystemSetting(data)
  }

  async delete(key: string): Promise<void> {
    const { error } = await this.supabase
      .from('system_settings')
      .delete()
      .eq('key', key)

    if (error) {
      throw new Error(`Failed to delete system setting: ${error.message}`)
    }
  }

  private mapSystemSetting(data: Record<string, unknown>): SystemSetting {
    return {
      id: String(data.id),
      key: String(data.key),
      value: data.value,
      category: String(data.category) as SystemSetting['category'],
      description: data.description ? String(data.description) : null,
      createdAt: new Date(String(data.created_at)),
      updatedAt: new Date(String(data.updated_at)),
    }
  }
}
