#!/usr/bin/env tsx

/**
 * Apply Migration 013: Delivery Orders
 *
 * Usage:
 *   npx tsx scripts/apply-migration-013.ts
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import { createAdminClient } from '@/lib/supabase/admin-client'

async function applyMigration() {
  console.log('🔄 Applying migration 013: Delivery Orders...')

  const supabase = createAdminClient()

  try {
    const migrationPath = join(
      process.cwd(),
      'lib/supabase/migrations/013_delivery_orders.sql'
    )
    const sql = await readFile(migrationPath, 'utf-8')

    const { error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }

    console.log('✅ Migration 013 applied successfully')

    // Verify table exists
    const { data, error: verifyError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'delivery_orders'
      `,
    })

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError)
      process.exit(1)
    }

    console.log('✅ Verification complete — delivery_orders table created')
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  }
}

applyMigration()
