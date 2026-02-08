#!/usr/bin/env tsx

// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin-client'

async function createTestAdmin() {
  console.log('👤 Creating test admin account...\n')

  const supabase = createAdminClient()

  const email = 'admin@test.com'
  const password = 'TestAdmin123!'

  // Check if user already exists
  const { data: existing } = await supabase.auth.admin.listUsers()
  const existingUser = existing?.users.find(u => u.email === email)

  if (existingUser) {
    console.log('✅ Test admin already exists')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   User ID: ${existingUser.id}\n`)

    // Make sure they're admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', existingUser.id)
      .single()

    if (!profile?.is_admin) {
      await supabase
        .from('user_profiles')
        .update({ is_admin: true })
        .eq('user_id', existingUser.id)
      console.log('✅ Updated to admin status')
    }

    return
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    console.error('❌ Failed to create auth user:', authError?.message)
    process.exit(1)
  }

  console.log('✅ Created auth user')

  // Get first restaurant
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id')
    .limit(1)

  if (!restaurants || restaurants.length === 0) {
    console.error('❌ No restaurants found')
    process.exit(1)
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      user_id: authData.user.id,
      restaurant_id: restaurants[0].id,
      role: 'owner',
      display_name: 'Test Admin',
      is_admin: true,
    })

  if (profileError) {
    console.error('❌ Failed to create profile:', profileError.message)
    await supabase.auth.admin.deleteUser(authData.user.id)
    process.exit(1)
  }

  console.log('✅ Created user profile\n')
  console.log('🎉 Test admin created successfully!')
  console.log('')
  console.log('Login credentials:')
  console.log(`   Email: ${email}`)
  console.log(`   Password: ${password}`)
  console.log('')
  console.log('Use these to login at: http://localhost:3000/login')
}

createTestAdmin()
