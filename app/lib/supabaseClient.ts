import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl === 'https://placeholder-url.supabase.co') {
    console.warn('[SUPABASE] WARNING: Running with placeholder URL. Database features will fail in production.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
