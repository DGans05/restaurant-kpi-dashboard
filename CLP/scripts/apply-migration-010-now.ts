#!/usr/bin/env tsx

/**
 * Apply Migration 010: Admin Infrastructure
 *
 * This script applies migration 010 directly using the Supabase admin client.
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

async function applyMigration() {
  console.log('🔄 Starting migration 010: Admin Infrastructure...\n')

  // Load environment variables
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: Supabase environment variables not found')
    console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
    process.exit(1)
  }

  // Create admin client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Read migration file
    const migrationPath = join(process.cwd(), 'lib/supabase/migrations/010_admin_infrastructure.sql')
    const sql = await readFile(migrationPath, 'utf-8')

    console.log('📄 Migration file loaded')
    console.log(`   Size: ${sql.length} characters\n`)

    // Split into individual statements (separated by semicolons)
    // This is a simple split - may need refinement for complex SQL
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Executing ${statements.length} SQL statements...\n`)

    let successCount = 0
    let errorCount = 0

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.length === 0) {
        continue
      }

      // Show progress for key operations
      if (statement.includes('CREATE TABLE') || statement.includes('ALTER TABLE')) {
        const match = statement.match(/(?:CREATE TABLE|ALTER TABLE)\s+(?:IF NOT EXISTS\s+)?(\w+)/i)
        if (match) {
          console.log(`   ⚙️  Processing: ${match[1]}`)
        }
      }

      try {
        const { error } = await supabase.rpc('exec', { sql: statement + ';' })

        if (error) {
          // Try direct query if RPC doesn't exist
          const { error: queryError } = await supabase.from('_migrations').select('*').limit(0)

          if (queryError?.code === '42P01') {
            // Table doesn't exist, need to use raw SQL
            console.log('\n⚠️  Note: Cannot execute via RPC. Please use Supabase SQL Editor instead.')
            console.log('\n📋 Instructions:')
            console.log('   1. Go to: https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/sql/new')
            console.log('   2. Copy contents of: lib/supabase/migrations/010_admin_infrastructure.sql')
            console.log('   3. Paste into SQL Editor and click "Run"\n')
            process.exit(1)
          }

          throw error
        }

        successCount++
      } catch (err) {
        errorCount++
        console.error(`   ❌ Error in statement ${i + 1}:`, err)

        // For critical errors, show the statement
        if (statement.includes('CREATE TABLE') || statement.includes('ALTER TABLE')) {
          console.error(`   Statement: ${statement.substring(0, 100)}...`)
        }
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`✅ Migration completed: ${successCount} successful, ${errorCount} failed`)
    console.log('='.repeat(60) + '\n')

    // Verify key tables exist
    console.log('🔍 Verifying migration...')

    const checks = [
      { table: 'system_settings', description: 'System settings table' },
      { table: 'audit_logs', description: 'Audit logs table' },
    ]

    for (const check of checks) {
      const { data, error } = await supabase
        .from(check.table)
        .select('*')
        .limit(1)

      if (error) {
        console.log(`   ❌ ${check.description}: NOT FOUND`)
        console.log(`      Error: ${error.message}`)
      } else {
        console.log(`   ✅ ${check.description}: EXISTS`)
      }
    }

    // Check if is_admin column exists
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .limit(1)

    if (profileError) {
      console.log('   ❌ is_admin column: NOT FOUND')
    } else {
      console.log('   ✅ is_admin column: EXISTS')
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 Migration Status: COMPLETE')
    console.log('='.repeat(60) + '\n')

    console.log('📝 Next Steps:')
    console.log('   1. Set an admin user:')
    console.log('      UPDATE user_profiles SET is_admin = true WHERE user_id = \'<your-user-id>\';')
    console.log('   2. Start dev server: npm run dev')
    console.log('   3. Navigate to: http://localhost:3000/admin\n')

  } catch (err) {
    console.error('\n❌ Migration failed:', err)
    console.error('\n💡 Fallback: Use Supabase SQL Editor')
    console.error('   1. Go to: https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/sql/new')
    console.error('   2. Copy contents of: lib/supabase/migrations/010_admin_infrastructure.sql')
    console.error('   3. Paste and run\n')
    process.exit(1)
  }
}

// Load .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

applyMigration()
