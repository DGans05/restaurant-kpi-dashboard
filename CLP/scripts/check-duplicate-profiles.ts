#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin-client'

async function checkDuplicates() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, user_id, restaurant_id, is_admin, created_at')
    .eq('user_id', '9d4b271e-ab6b-4379-bff5-e8db899756e1')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Profiles for damian.gans@outlook.com (9d4b271e-ab6b-4379-bff5-e8db899756e1):')
  console.log(JSON.stringify(data, null, 2))

  if (data && data.length > 1) {
    console.log('\n⚠️  Found duplicate profiles!')
    console.log('Keeping the first one (oldest), deleting the rest...')

    const toDelete = data.slice(1)
    for (const profile of toDelete) {
      const { error: delError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', profile.id)

      if (delError) {
        console.error(`Failed to delete ${profile.id}:`, delError)
      } else {
        console.log(`✅ Deleted duplicate profile ${profile.id}`)
      }
    }
  } else {
    console.log('\n✅ No duplicates found')
  }
}

checkDuplicates()
