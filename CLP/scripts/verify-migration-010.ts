#!/usr/bin/env tsx

/**
 * Verify Migration 010 was applied successfully
 */

// Load environment variables first
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin-client'

async function verifyMigration() {
  console.log('🔍 Verifying Migration 010...\n')

  const supabase = createAdminClient()

  const checks = [
    {
      name: 'system_settings table',
      test: async () => {
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, category')
          .limit(5)
        return { success: !error, data, error }
      }
    },
    {
      name: 'audit_logs table',
      test: async () => {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('id')
          .limit(1)
        return { success: !error, data, error }
      }
    },
    {
      name: 'is_admin column',
      test: async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, is_admin, deleted_at')
          .limit(1)
        return { success: !error, data, error }
      }
    },
    {
      name: 'deleted_at column in user_profiles',
      test: async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, deleted_at')
          .limit(1)
        return { success: !error && data !== null, data, error }
      }
    },
    {
      name: 'deleted_at column in restaurants',
      test: async () => {
        const { data, error } = await supabase
          .from('restaurants')
          .select('id, deleted_at')
          .limit(1)
        return { success: !error && data !== null, data, error }
      }
    }
  ]

  let allPassed = true

  for (const check of checks) {
    const result = await check.test()

    if (result.success) {
      console.log(`✅ ${check.name}`)
      if (result.data && result.data.length > 0) {
        console.log(`   Found ${result.data.length} row(s)`)
      }
    } else {
      console.log(`❌ ${check.name}`)
      console.log(`   Error: ${result.error?.message || 'Unknown error'}`)
      allPassed = false
    }
  }

  console.log('\n' + '='.repeat(60))

  if (allPassed) {
    console.log('✅ Migration 010 verified successfully!')
    console.log('='.repeat(60) + '\n')

    // Check for admin users
    console.log('👤 Checking for admin users...\n')

    const { data: adminUsers, error: adminError } = await supabase
      .from('user_profiles')
      .select('id, user_id, display_name, is_admin, restaurant_id')
      .eq('is_admin', true)

    if (adminError) {
      console.log('⚠️  Could not check admin users:', adminError.message)
    } else if (!adminUsers || adminUsers.length === 0) {
      console.log('⚠️  No admin users found yet')
      console.log('\n📝 To set an admin user, run this SQL:')
      console.log('\nUPDATE user_profiles')
      console.log('SET is_admin = true')
      console.log('WHERE user_id = \'<your-user-id>\';')
      console.log('\nOr find all users:')
      console.log('\nSELECT u.id, u.email, p.display_name, p.is_admin')
      console.log('FROM auth.users u')
      console.log('JOIN user_profiles p ON p.user_id = u.id;')
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):`)
      for (const admin of adminUsers) {
        console.log(`   - ${admin.display_name || 'No name'} (${admin.user_id})`)
      }
      console.log('\n🎉 You can now access the admin dashboard at:')
      console.log('   http://localhost:3000/admin')
    }
  } else {
    console.log('❌ Migration verification failed')
    console.log('='.repeat(60) + '\n')
    console.log('Some checks failed. Please review the migration.')
  }

  console.log('')
}

verifyMigration()
