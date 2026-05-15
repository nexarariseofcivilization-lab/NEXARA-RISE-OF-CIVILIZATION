import { createClient } from '@supabase/supabase-js';

// Server-side only Supabase client utilizing Service Role Key
// This bypasses RLS and should NEVER be exposed to the client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
    if (!_supabaseAdmin) {
        if (!supabaseUrl || !supabaseServiceKey) {
            console.warn("Missing Supabase URL or Service Role Key! Falling back to unauthenticated or mock execution if necessary.");
        }
        _supabaseAdmin = createClient(supabaseUrl || 'https://mock.supabase.co', supabaseServiceKey || 'mock-key', {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }
    return _supabaseAdmin;
}
