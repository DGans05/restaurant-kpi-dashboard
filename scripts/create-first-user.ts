/**
 * Create First User Script
 * Creates a Supabase Auth user and links them to a restaurant via user_profiles
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function main() {
  console.log('=== Create First User ===\n')

  // Load env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set')
    console.error('Make sure .env.local is loaded or set these env vars')
    process.exit(1)
  }

  // Use service role client (bypasses RLS)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Get user details
  const email = await question('Email: ')
  const password = await question('Password: ')
  const displayName = await question('Display Name: ')
  const restaurantId = await question('Restaurant ID (default: rosmalen): ') || 'rosmalen'
  const role = await question('Role (owner/manager/viewer, default: owner): ') || 'owner'

  console.log('\nCreating user...')

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm
  })

  if (authError) {
    console.error('Error creating auth user:', authError.message)
    rl.close()
    process.exit(1)
  }

  const userId = authData.user!.id
  console.log(`✓ Auth user created: ${userId}`)

  // Create user profile
  const { error: profileError } = await supabase.from('user_profiles').insert({
    user_id: userId,
    restaurant_id: restaurantId,
    role,
    display_name: displayName,
  })

  if (profileError) {
    console.error('Error creating user profile:', profileError.message)
    console.log('Note: Auth user was created but profile linking failed.')
    rl.close()
    process.exit(1)
  }

  console.log(`✓ User profile created and linked to restaurant: ${restaurantId}`)

  // Verify restaurant exists
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .single()

  if (restaurantError || !restaurant) {
    console.warn(`⚠ Warning: Restaurant "${restaurantId}" not found in database`)
    console.warn('You may need to create it first.')
  } else {
    console.log(`✓ Verified restaurant exists: ${restaurant.name}`)
  }

  console.log('\n=== User Created Successfully ===')
  console.log(`Email: ${email}`)
  console.log(`User ID: ${userId}`)
  console.log(`Restaurant: ${restaurantId}`)
  console.log(`Role: ${role}`)
  console.log(`Display Name: ${displayName}`)

  rl.close()
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  rl.close()
  process.exit(1)
})
