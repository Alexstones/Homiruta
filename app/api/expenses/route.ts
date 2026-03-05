import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const routeId = searchParams.get('routeId');

        let query = supabase
            .from('expenses')
            .select('*')
            .eq('driver_id', (session.user as any).id)
            .order('date', { ascending: false });

        if (routeId && routeId !== 'NONE') {
            query = query.eq('route_id', routeId);
        }

        const { data: expenses, error } = await query;

        if (error) throw error;

        return NextResponse.json(expenses);
    } catch (error: any) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { type, amount, description, routeId, date } = await req.json();

        if (!type || !amount) {
            return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 });
        }

        const { data: newExpense, error } = await supabase
            .from('expenses')
            .insert({
                driver_id: (session.user as any).id,
                route_id: routeId && routeId !== 'NONE' ? routeId : null,
                type,
                amount,
                description,
                date: date ? new Date(date).toISOString() : new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(newExpense, { status: 201 });
    } catch (error: any) {
        console.error('Error creating expense:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

