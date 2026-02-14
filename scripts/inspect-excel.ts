#!/usr/bin/env tsx
/**
 * Inspect Excel file structure to understand column headers
 */

import { readFileSync } from 'fs';
import * as XLSX from 'xlsx';
import * as path from 'path';

const file = '5_New_Einde_Dag_Rapportage_update_ROS_30072025.xlsx';
const fullPath = path.join(process.cwd(), file);

const buffer = readFileSync(fullPath);
const workbook = XLSX.read(buffer, { type: 'buffer' });

console.log('📋 Sheets:', workbook.SheetNames);

for (const sheetName of workbook.SheetNames) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Sheet: ${sheetName}`);
  console.log('='.repeat(80));

  const worksheet = workbook.Sheets[sheetName];

  // Get as JSON with default header
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

  console.log(`Total rows: ${jsonData.length}`);

  // Show first 10 rows
  console.log(`\nFirst 10 rows:`);
  for (let i = 0; i < Math.min(10, jsonData.length); i++) {
    const row = jsonData[i] as any[];
    console.log(`\nRow ${i}:`);
    row.forEach((cell, idx) => {
      if (cell !== null && cell !== undefined && cell !== '') {
        console.log(`  [${idx}]: ${JSON.stringify(cell)}`);
      }
    });
  }

  // Try with header detection
  console.log(`\n--- With Header Detection ---`);
  const withHeaders = XLSX.utils.sheet_to_json(worksheet, { defval: null });
  if (withHeaders.length > 0) {
    console.log(`Detected headers:`, Object.keys(withHeaders[0]));
    console.log(`\nFirst data row:`, withHeaders[0]);
  }
}
