#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin-client'

async function restoreProfile() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: '9d4b271e-ab6b-4379-bff5-e8db899756e1',
      restaurant_id: 'hinthammerstraat',
      role: 'owner',
      is_admin: true,
    })
    .select()

  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  console.log('✅ Restored profile for hinthammerstraat')
  console.log(data)
}

restoreProfile()
