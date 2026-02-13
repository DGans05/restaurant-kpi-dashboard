import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const sql = readFileSync(
    join(__dirname, "../lib/supabase/migrations/014_dashboard_layouts.sql"),
    "utf-8"
  );

  const { error } = await supabase.rpc("exec_sql", { sql });
  if (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  console.log("Migration 014_dashboard_layouts applied successfully");
}

main();
