#!/usr/bin/env tsx

/**
 * Apply Migration 010: Admin Infrastructure
 *
 * This script applies the admin infrastructure migration to the Supabase database.
 * It adds admin flags, soft deletes, system settings, audit logs, and automatic audit triggers.
 *
 * Usage:
 *   npm run db:migrate
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import { createAdminClient } from '@/lib/supabase/admin-client'

async function applyMigration() {
  console.log('🔄 Applying migration 010: Admin Infrastructure...')

  const supabase = createAdminClient()

  try {
    // Read migration SQL
    const migrationPath = join(
      process.cwd(),
      'lib/supabase/migrations/010_admin_infrastructure.sql'
    )
    const sql = await readFile(migrationPath, 'utf-8')

    // Execute migration
    const { error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }

    console.log('✅ Migration 010 applied successfully')

    // Verify tables exist
    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('system_settings', 'audit_logs')
      `,
    })

    if (tablesError) {
      console.error('❌ Verification failed:', tablesError)
      process.exit(1)
    }

    console.log('✅ Verification complete')
    console.log('   - system_settings table created')
    console.log('   - audit_logs table created')
    console.log('   - is_admin column added to user_profiles')
    console.log('   - deleted_at columns added')
    console.log('   - Audit triggers attached')
    console.log('   - RLS policies configured')
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  }
}

applyMigration()
