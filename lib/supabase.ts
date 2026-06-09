import { createClient } from '@supabase/supabase-js'

// ── Browser client (safe to expose) ──────────────────────────────────────────
// Uses the publishable key. Import this in frontend JS that runs in the browser.
// Vite exposes VITE_* variables to the browser bundle via import.meta.env.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

// ── Server / admin client (NEVER import in browser code) ─────────────────────
// Uses the secret key with full database privileges.
// Only use in server-side contexts (Node.js scripts, build-time, FastAPI → JS bridge).
// process.env variables WITHOUT the VITE_ prefix are never bundled into the browser.
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY as string

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
