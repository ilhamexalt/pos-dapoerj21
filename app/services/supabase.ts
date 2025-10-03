import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
    if (cachedClient) return cachedClient;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
        | string
        | undefined;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            "Supabase credentials are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment variables."
        );
    }

    cachedClient = createClient(supabaseUrl, supabaseAnonKey);
    return cachedClient;
}


