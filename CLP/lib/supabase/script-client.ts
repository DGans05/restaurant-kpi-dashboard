/**
 * Supabase client for scripts (non-Next.js contexts)
 * Uses service role key for server-side operations without cookies
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Create Supabase client for scripts
 * Uses anon key (not service role) for safety
 */
export function createScriptClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
}
