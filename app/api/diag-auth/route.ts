import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Check Env Vars
        const envStatus = {
            HAS_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            HAS_SUPABASE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            HAS_NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
            HAS_NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
        };

        // 2. Check Database Connectivity
        let dbStatus = 'Pending';
        let dbError = null;
        let adminExists = false;

        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, email, password_hash')
                .eq('email', 'admin@hormiruta.com')
                .single();

            if (error) {
                dbStatus = 'Error';
                dbError = error.message;
            } else {
                dbStatus = 'Connected';
                adminExists = !!data;
                // DO NOT expose password_hash
            }
        } catch (e: any) {
            dbStatus = 'Exception';
            dbError = e.message;
        }

        return NextResponse.json({
            status: 'Diagnostic Complete',
            environment: envStatus,
            database: {
                status: dbStatus,
                error: dbError,
                admin_user_found: adminExists
            }
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
