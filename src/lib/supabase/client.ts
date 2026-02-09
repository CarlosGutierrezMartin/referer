import { createBrowserClient } from '@supabase/ssr';

// Cliente de Supabase para componentes del lado del cliente
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

