import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { data: route, error } = await supabase
            .from('routes')
            .select(`
                *,
                stops (*)
            `)
            .eq('id', params.id)
            .eq('user_id', (session.user as any).id)
            .single();

        if (error || !route) {
            return NextResponse.json({ message: 'Ruta no encontrada' }, { status: 404 });
        }

        return NextResponse.json(route);
    } catch (error: any) {
        console.error('Error fetching route:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { error } = await supabase
            .from('routes')
            .delete()
            .eq('id', params.id)
            .eq('user_id', (session.user as any).id);

        if (error) throw error;

        return NextResponse.json({ message: 'Ruta eliminada' });
    } catch (error: any) {
        console.error('Error deleting route:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

