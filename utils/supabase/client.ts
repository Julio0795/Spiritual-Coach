import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Note: Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
  // are defined in your .env.local file. Empty strings are used as fallback
  // to satisfy TypeScript, but the app will not work without proper values.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  )
}

