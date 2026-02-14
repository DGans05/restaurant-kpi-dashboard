/**
 * Bulk upload reports from ../rapportage/ directory to Supabase
 *
 * Usage: npx tsx scripts/bulk-upload-reports.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const RESTAURANT_ID = 'rosmalen'
const BUCKET_NAME = 'reports'
const RAPPORTAGE_DIR = path.resolve(__dirname, '../../rapportage')

// Map filename patterns to report types and extract periods
interface FileMapping {
  pattern: RegExp
  reportType: string
  extractPeriod: (match: RegExpMatchArray, fileName: string) => string
  reportName: (fileName: string) => string
}

const FILE_MAPPINGS: readonly FileMapping[] = [
  {
    // Operationeel_rapport_06-02-2026_10_38.xlsx
    pattern: /^Operationeel_rapport_(\d{2})-(\d{2})-(\d{4})_/,
    reportType: 'OPERATIONAL',
    extractPeriod: (match) => `${match[3]}-${match[2]}-${match[1]}`,
    reportName: (fn) => fn.replace(/\.[^.]+$/, ''),
  },
  {
    // Urenregistratie_rapport_20251201_20260101.xlsx
    pattern: /^Urenregistratie_rapport_(\d{4})(\d{2})(\d{2})_/,
    reportType: 'TIME_KEEPING',
    extractPeriod: (match) => `${match[1]}-${match[2]}-${match[3]}`,
    reportName: (fn) => fn.replace(/\.[^.]+$/, ''),
  },
  {
    // Coupon_rapport_Rosmalen_Dorpsstraat_20251201_20251231.xlsx
    pattern: /^Coupon_rapport_.*_(\d{4})(\d{2})(\d{2})_/,
    reportType: 'COUPON_DISCOUNT',
    extractPeriod: (match) => `${match[1]}-${match[2]}-${match[3]}`,
    reportName: (fn) => fn.replace(/\.[^.]+$/, ''),
  },
  {
    // Product_verkoop_per_uur_rapport_20251201_20260101.xlsx
    pattern: /^Product_verkoop_per_uur_rapport_(\d{4})(\d{2})(\d{2})_/,
    reportType: 'ORDER_BY_HOURS',
    extractPeriod: (match) => `${match[1]}-${match[2]}-${match[3]}`,
    reportName: (fn) => fn.replace(/\.[^.]+$/, ''),
  },
  {
    // arbeidsrappoort 1.pdf
    pattern: /^arbeidsrappoo?rt/i,
    reportType: 'LABOUR',
    extractPeriod: () => '2026-02-01', // No date in filename, default to current month
    reportName: (fn) => fn.replace(/\.[^.]+$/, ''),
  },
]

interface UploadResult {
  fileName: string
  reportType: string
  period: string
  success: boolean
  error?: string
}

function matchFile(fileName: string): { reportType: string; period: string; reportName: string } | null {
  for (const mapping of FILE_MAPPINGS) {
    const match = fileName.match(mapping.pattern)
    if (match) {
      return {
        reportType: mapping.reportType,
        period: mapping.extractPeriod(match, fileName),
        reportName: mapping.reportName(fileName),
      }
    }
  }
  return null
}

async function uploadFile(
  supabase: ReturnType<typeof createClient>,
  filePath: string,
  fileName: string,
  reportType: string,
  period: string,
  reportName: string,
): Promise<UploadResult> {
  const fileBuffer = fs.readFileSync(filePath)
  const fileSize = fs.statSync(filePath).size
  const extension = path.extname(fileName)
  const [year, month] = period.split('-')

  const storagePath = `${RESTAURANT_ID}/${reportType}/${year}/${month}/${reportType}_${period}_${Date.now()}${extension}`

  // Upload to storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: extension === '.pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      upsert: false,
    })

  if (storageError) {
    return { fileName, reportType, period, success: false, error: `Storage: ${storageError.message}` }
  }

  // Insert database record
  const { error: dbError } = await supabase
    .from('reports')
    .insert({
      restaurant_id: RESTAURANT_ID,
      report_type: reportType,
      report_name: reportName,
      report_period: period,
      file_path: storagePath,
      file_size_bytes: fileSize,
      upload_status: 'uploaded',
    })

  if (dbError) {
    return { fileName, reportType, period, success: false, error: `DB: ${dbError.message}` }
  }

  return { fileName, reportType, period, success: true }
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  if (!fs.existsSync(RAPPORTAGE_DIR)) {
    console.error(`Rapportage directory not found: ${RAPPORTAGE_DIR}`)
    process.exit(1)
  }

  const files = fs.readdirSync(RAPPORTAGE_DIR)
    .filter(f => !f.startsWith('.'))
    .filter(f => f.endsWith('.xlsx') || f.endsWith('.pdf'))

  console.log(`Found ${files.length} report files in ${RAPPORTAGE_DIR}\n`)

  const results: UploadResult[] = []

  for (const fileName of files) {
    const mapping = matchFile(fileName)

    if (!mapping) {
      console.log(`  SKIP  ${fileName} (no matching report type)`)
      results.push({ fileName, reportType: 'UNKNOWN', period: '', success: false, error: 'No matching report type' })
      continue
    }

    console.log(`  UPLOAD  ${fileName} -> ${mapping.reportType} (${mapping.period})`)
    const result = await uploadFile(
      supabase,
      path.join(RAPPORTAGE_DIR, fileName),
      fileName,
      mapping.reportType,
      mapping.period,
      mapping.reportName,
    )
    results.push(result)

    if (result.success) {
      console.log(`    OK`)
    } else {
      console.log(`    FAIL: ${result.error}`)
    }
  }

  // Summary
  const succeeded = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success && r.error !== 'No matching report type').length
  const skipped = results.filter(r => r.error === 'No matching report type').length

  console.log(`\n--- Summary ---`)
  console.log(`  Uploaded: ${succeeded}`)
  console.log(`  Failed:   ${failed}`)
  console.log(`  Skipped:  ${skipped}`)
}

main().catch(console.error)
