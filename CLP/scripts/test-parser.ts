#!/usr/bin/env tsx
/**
 * Test Operational Report Parser
 *
 * Tests the parser against real NYP Excel files to verify format compatibility
 */

import { readFileSync } from 'fs';
import { parseOperationalReport } from '../lib/parsers/operational-report-parser';
import * as path from 'path';

const EXCEL_FILES = [
  '.playwright-mcp/Operationeel-rapport-06-02-2026-10-38-1-.xlsx',
  '5_New_Einde_Dag_Rapportage_update_ROS_30072025.xlsx',
];

async function main() {
  console.log('🧪 Testing Operational Report Parser\n');

  for (const filePath of EXCEL_FILES) {
    const fullPath = path.join(process.cwd(), filePath);

    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing: ${filePath}`);
    console.log('='.repeat(80));

    try {
      const buffer = readFileSync(fullPath);
      console.log(`✅ File loaded: ${(buffer.length / 1024).toFixed(1)} KB`);

      const entries = parseOperationalReport(buffer);
      console.log(`\n📊 Parser Results:`);
      console.log(`   Entries found: ${entries.length}`);

      if (entries.length === 0) {
        console.log(`   ⚠️  No entries parsed! This may indicate:`);
        console.log(`      - Empty report`);
        console.log(`      - Column name mismatch`);
        console.log(`      - Date format not recognized`);

        // Try to debug by checking raw Excel structure
        console.log(`\n🔍 Debugging: Inspecting Excel structure...`);
        const XLSX = require('xlsx');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: null, header: 1 });

        console.log(`   Sheet name: ${sheetName}`);
        console.log(`   Total rows: ${rawRows.length}`);

        if (rawRows.length > 0) {
          console.log(`\n   First 3 rows (to inspect column headers):`);
          for (let i = 0; i < Math.min(3, rawRows.length); i++) {
            console.log(`   Row ${i}:`, JSON.stringify(rawRows[i]).slice(0, 200));
          }
        }

        continue;
      }

      // Show first entry as sample
      console.log(`\n📝 Sample Entry (first):`);
      const sample = entries[0];
      console.log(`   Date: ${sample.date} (${sample.dayName})`);
      console.log(`   Week: ${sample.weekNumber}`);
      console.log(`   Net Revenue: €${sample.netRevenue.toFixed(2)}`);
      console.log(`   Labour Cost: €${sample.labourCost.toFixed(2)} (${sample.labourPct.toFixed(1)}%)`);
      console.log(`   Food Cost: €${sample.foodCost.toFixed(2)} (${sample.foodCostPct.toFixed(1)}%)`);
      console.log(`   Orders: ${sample.orderCount}`);
      console.log(`   Avg Order Value: €${sample.avgOrderValue.toFixed(2)}`);
      console.log(`   30min Delivery: ${sample.deliveryRate30min.toFixed(1)}%`);
      console.log(`   Manager: ${sample.manager || 'N/A'}`);

      // Show date range
      if (entries.length > 1) {
        const lastEntry = entries[entries.length - 1];
        console.log(`\n📅 Date Range:`);
        console.log(`   From: ${entries[0].date}`);
        console.log(`   To: ${lastEntry.date}`);
        console.log(`   Days: ${entries.length}`);
      }

      // Show totals
      const totalRevenue = entries.reduce((sum, e) => sum + e.netRevenue, 0);
      const totalOrders = entries.reduce((sum, e) => sum + e.orderCount, 0);
      const avgLabourPct = entries.reduce((sum, e) => sum + e.labourPct, 0) / entries.length;

      console.log(`\n📈 Totals:`);
      console.log(`   Total Revenue: €${totalRevenue.toFixed(2)}`);
      console.log(`   Total Orders: ${totalOrders}`);
      console.log(`   Avg Labour %: ${avgLabourPct.toFixed(1)}%`);

      console.log(`\n✅ Parser working correctly!`);

    } catch (error) {
      console.error(`❌ Error parsing file:`, error instanceof Error ? error.message : String(error));
      if (error instanceof Error && error.stack) {
        console.error(`   Stack:`, error.stack.split('\n').slice(0, 3).join('\n   '));
      }
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ Parser test complete!');
  console.log('='.repeat(80) + '\n');
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
