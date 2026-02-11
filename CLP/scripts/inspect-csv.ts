import * as XLSX from "xlsx";
import * as fs from "fs";

const filePath = process.argv[2];
if (!filePath) { console.error("Usage: tsx scripts/inspect-csv.ts <file>"); process.exit(1); }

const buffer = fs.readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: "buffer" });

console.log("Sheets:", workbook.SheetNames);

const ws = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: null });

console.log("\nFirst 15 rows (raw):");
rows.slice(0, 15).forEach((row, i) => {
  console.log(`Row ${i}:`, JSON.stringify(row));
});
