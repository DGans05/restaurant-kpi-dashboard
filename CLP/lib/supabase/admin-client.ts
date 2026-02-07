import { createClient } from "@supabase/supabase-js";

/**
 * Create Supabase admin client for backend operations (cron jobs, API routes)
 * Uses service role key to bypass RLS policies
 * NEVER expose this client to the browser
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceKey);
}
