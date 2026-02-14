#!/usr/bin/env tsx

/**
 * Apply Migration 014: Dashboard Layouts
 *
 * Usage:
 *   npx tsx scripts/apply-migration-014.ts
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, {
  db: { schema: 'public' },
  auth: { persistSession: false },
})

async function run() {
  console.log('Applying migration 014: Dashboard Layouts...')

  // Check if table already exists
  const { data: existing } = await supabase
    .from('dashboard_layouts')
    .select('id')
    .limit(0)

  if (existing !== null) {
    console.log('Table dashboard_layouts already exists, skipping.')
    return
  }

  // Table doesn't exist — need to run SQL via Supabase Dashboard SQL Editor
  // Copy the SQL from: lib/supabase/migrations/014_dashboard_layouts.sql
  console.log('')
  console.log('The dashboard_layouts table does not exist yet.')
  console.log('Please run the following SQL in the Supabase Dashboard SQL Editor:')
  console.log('  https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/sql')
  console.log('')
  console.log('File: lib/supabase/migrations/014_dashboard_layouts.sql')

  const { readFile } = await import('fs/promises')
  const { join } = await import('path')
  const sql = await readFile(
    join(process.cwd(), 'lib/supabase/migrations/014_dashboard_layouts.sql'),
    'utf-8'
  )
  console.log('')
  console.log(sql)
}

run()
