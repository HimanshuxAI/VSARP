import { createClient } from '@supabase/supabase-js';

export const supabaseUrl =
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    '';

export const supabaseKey =
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_KEY ||
    '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'public-placeholder-key';

export const supabase = createClient(
    isSupabaseConfigured ? supabaseUrl : fallbackUrl,
    isSupabaseConfigured ? supabaseKey : fallbackKey,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    }
);

export function formatSupabaseError(error) {
    const message = error?.message || 'Something went wrong while talking to Supabase.';

    if (
        message.includes("Could not find the table 'public.profiles'") ||
        message.includes("Could not find the relation 'public.profiles'") ||
        message.includes('schema cache')
    ) {
        return new Error(
            'Your Supabase database is not initialized yet. Run supabase/reset_all.sql first, then run supabase/schema.sql in the Supabase SQL editor.'
        );
    }

    return error instanceof Error ? error : new Error(message);
}
