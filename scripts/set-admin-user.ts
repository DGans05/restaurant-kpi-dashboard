#!/usr/bin/env tsx

/**
 * Set a user as admin
 */

// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin-client'

async function setAdminUser() {
  console.log('👥 Listing all users...\n')

  const supabase = createAdminClient()

  // Get all users with their profiles
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, user_id, display_name, restaurant_id, role, is_admin, created_at')
    .order('created_at', { ascending: true })

  if (profileError) {
    console.error('❌ Error fetching users:', profileError.message)
    process.exit(1)
  }

  if (!profiles || profiles.length === 0) {
    console.log('⚠️  No users found in the database')
    console.log('\nYou need to create a user first.')
    console.log('Visit: http://localhost:3000/login')
    process.exit(0)
  }

  // Get auth user details
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('⚠️  Could not fetch auth details:', authError.message)
  }

  // Map auth emails to profiles
  const usersWithEmails = profiles.map(profile => {
    const authUser = authUsers?.users.find(u => u.id === profile.user_id)
    return {
      ...profile,
      email: authUser?.email || 'Unknown'
    }
  })

  console.log('Found users:')
  console.log('─'.repeat(80))
  usersWithEmails.forEach((user, index) => {
    const adminBadge = user.is_admin ? '👑 ADMIN' : ''
    console.log(`${index + 1}. ${user.email} ${adminBadge}`)
    console.log(`   Name: ${user.display_name || 'N/A'}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   User ID: ${user.user_id}`)
    console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`)
    console.log('')
  })
  console.log('─'.repeat(80))

  // If no args provided, just list and exit
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.log('\n📝 To set a user as admin, run:')
    console.log('   npx tsx scripts/set-admin-user.ts <user-id>')
    console.log('\nOr set the first user as admin:')
    console.log('   npx tsx scripts/set-admin-user.ts first')
    process.exit(0)
  }

  // Set admin
  let targetUserId: string

  if (args[0] === 'first') {
    targetUserId = usersWithEmails[0].user_id
    console.log(`\n🎯 Setting first user as admin: ${usersWithEmails[0].email}`)
  } else {
    targetUserId = args[0]
    const targetUser = usersWithEmails.find(u => u.user_id === targetUserId)
    if (!targetUser) {
      console.error(`\n❌ User not found: ${targetUserId}`)
      process.exit(1)
    }
    console.log(`\n🎯 Setting user as admin: ${targetUser.email}`)
  }

  // Update user
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ is_admin: true })
    .eq('user_id', targetUserId)

  if (updateError) {
    console.error('❌ Failed to set admin:', updateError.message)
    process.exit(1)
  }

  console.log('✅ User is now an admin!\n')
  console.log('🎉 Next steps:')
  console.log('   1. Start dev server: npm run dev')
  console.log('   2. Login with this user')
  console.log('   3. Navigate to: http://localhost:3000/admin')
  console.log('')
}

setAdminUser()
