import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || '';

        let supabaseQuery = supabase
            .from('users')
            .select('id, email, name, image, role, plan, subscription_status, created_at')
            .order('created_at', { ascending: false });

        if (query) {
            supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%`);
        }

        const { data: users, error } = await supabaseQuery;

        if (error) throw error;

        return NextResponse.json(users);
    } catch (error) {
        console.error("[ADMIN_USERS] Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

