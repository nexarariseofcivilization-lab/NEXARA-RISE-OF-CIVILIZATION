'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// SINGLETON PATTERN: prevents multiple instances during hot reloading and route changes
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase URL and Anon Key are required');
    }
    
    if (!supabaseInstance) {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
            realtime: {
                params: {
                    eventsPerSecond: 10,
                }
            }
        });
    }

    return supabaseInstance;
};
