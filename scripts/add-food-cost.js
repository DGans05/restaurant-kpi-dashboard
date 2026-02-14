/**
 * Script to add foodCost and foodCostPct to all KPI entries
 * Target: 32-34% of net revenue with realistic variation
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lib/data/rosmalen-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Food cost percentages for each entry (varied realistically between 31-35%)
const foodCostPcts = [
  32.97, 33.45, 31.82, 33.21, 34.15, 32.58, 31.95, 33.78,
  32.44, 33.67, 32.91, 31.76, 33.42, 31.28, 32.85, 33.19,
  34.02, 32.37, 33.58, 31.94, 32.76, 33.91, 32.13, 33.65,
  31.87, 32.94, 33.48, 32.61
];

// Extract all netRevenue values from the entries
const netRevenueMatches = [...content.matchAll(/netRevenue: (\d+\.?\d*),/g)];

if (netRevenueMatches.length !== 28) {
  console.error(`Expected 28 entries, found ${netRevenueMatches.length}`);
  process.exit(1);
}

// For each entry, add foodCost and foodCostPct after labourProductivity
let entryIndex = 0;
content = content.replace(
  /labourProductivity: (\d+\.?\d*),\n(\s+)deliveryRate30min:/g,
  (match, productivity, indent) => {
    const netRevenue = parseFloat(netRevenueMatches[entryIndex][1]);
    const foodCostPct = foodCostPcts[entryIndex];
    const foodCost = (netRevenue * foodCostPct / 100).toFixed(2);

    entryIndex++;

    return `labourProductivity: ${productivity},\n${indent}foodCost: ${foodCost},\n${indent}foodCostPct: ${foodCostPct},\n${indent}deliveryRate30min:`;
  }
);

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✓ Successfully added foodCost to ${entryIndex} entries`);
console.log(`✓ Food cost range: ${Math.min(...foodCostPcts)}% - ${Math.max(...foodCostPcts)}%`);
