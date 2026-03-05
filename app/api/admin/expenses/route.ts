import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: expenses, error } = await supabase
            .from('expenses')
            .select(`
                *,
                driver:users (name, email)
            `)
            .order('date', { ascending: false });

        if (error) throw error;

        return NextResponse.json(expenses);
    } catch (error) {
        console.error("[ADMIN_EXPENSES] Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

