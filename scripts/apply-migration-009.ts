/**
 * Apply migration 009: Add INSERT/UPDATE/DELETE RLS policies for kpi_entries
 *
 * Run with: npx tsx scripts/apply-migration-009.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nMake sure these are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function applyMigration() {
  console.log('📦 Applying migration 009: kpi_entries write policies...\n')

  const migrationPath = path.join(__dirname, '..', 'lib', 'supabase', 'migrations', '009_kpi_entries_write_policies.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Try direct query if exec_sql doesn't exist
      const { error: directError } = await supabase.from('_').select().limit(0) as any

      // Split SQL into statements and execute each
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      console.log(`📝 Executing ${statements.length} SQL statements...\n`)

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        console.log(`   [${i + 1}/${statements.length}] ${statement.substring(0, 60)}...`)

        // Use raw SQL execution via Supabase
        const { error: stmtError } = await (supabase as any).rpc('exec_sql', { sql_query: statement + ';' })

        if (stmtError) {
          throw stmtError
        }
      }
    }

    console.log('\n✅ Migration 009 applied successfully!')
    console.log('\nNew RLS policies added:')
    console.log('  • Users can insert kpi_entries for their restaurants')
    console.log('  • Users can update their kpi_entries')
    console.log('  • Users can delete their kpi_entries')
    console.log('\n🔒 RLS Security: Users can now INSERT/UPDATE/DELETE KPI entries')
    console.log('   for restaurants they have access to via user_profiles table.\n')

  } catch (err) {
    console.error('\n❌ Migration failed:', err)
    console.error('\nPlease apply the migration manually via Supabase Dashboard:')
    console.error('1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new')
    console.error('2. Copy the SQL from: lib/supabase/migrations/009_kpi_entries_write_policies.sql')
    console.error('3. Execute the SQL in the SQL Editor')
    process.exit(1)
  }
}

applyMigration()
