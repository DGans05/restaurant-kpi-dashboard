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
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, display_name, is_admin, role')

  console.log('User profiles:')
  for (const profile of profiles || []) {
    const authUser = authData.users.find(u => u.id === profile.user_id)
    console.log(`${authUser?.email || 'Unknown'}: ${profile.role}${profile.is_admin ? ' (ADMIN)' : ''}`)
  }
}

checkAuthUsers()
