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
        const userId = searchParams.get('userId');

        let query = supabase
            .from('routes')
            .select(`
                *,
                user:users (name, email),
                stops (*)
            `)
            .order('date', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data: routes, error } = await query;

        if (error) throw error;

        return NextResponse.json(routes);
    } catch (error) {
        console.error("[ADMIN_ROUTES] Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

