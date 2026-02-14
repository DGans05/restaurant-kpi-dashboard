#!/usr/bin/env tsx

// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin-client'

async function checkAuthUsers() {
  console.log('👥 Checking auth.users...\n')

  const supabase = createAdminClient()

  // List all auth users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('❌ Error:', authError.message)
    process.exit(1)
  }

  console.log(`Found ${authData.users.length} auth users:\n`)

  for (const user of authData.users) {
    console.log(`📧 ${user.email}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`)
    console.log(`   Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
    console.log('')
  }

  // Check user profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('user_id, display_name, is_admin, role, deleted_at')

  if (profilesError) {
    console.error('❌ Error fetching user profiles:', profilesError.message)
    process.exit(1)
  }

  const profileMap = new Map<string, any[]>()
  for (const profile of profiles || []) {
    if (!profileMap.has(profile.user_id)) {
      profileMap.set(profile.user_id, [])
    }
    profileMap.get(profile.user_id)?.push(profile)
  }

  console.log('\nDetailed User profiles:')
  for (const [userId, userProfiles] of profileMap.entries()) {
    const authUser = authData.users.find(u => u.id === userId)
    console.log(`\nUser: ${authUser?.email || 'Unknown'}`)
    console.log(`  Auth ID: ${userId}`)
    
    if (userProfiles.length > 1) {
      console.warn('⚠️  WARNING: Duplicate profile entries for this user ID!')
    }

    userProfiles.forEach((profile, index) => {
      console.log(`  Profile ${index + 1}:`)
      console.log(`    Display Name: ${profile.display_name}`)
      console.log(`    Role: ${profile.role}`)
      console.log(`    Is Admin: ${profile.is_admin ? 'Yes' : 'No'}`)
      console.log(`    Deleted At: ${profile.deleted_at || 'Not deleted'}`)
    })
  }
}

checkAuthUsers()
