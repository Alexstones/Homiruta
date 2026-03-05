import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Security check: Only existing admins can create new admins
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
        }

        const { name, email, password } = await req.json();

        if (!email || !password || password.length < 6) {
            return NextResponse.json({ message: 'Datos incompletos o contraseña muy corta' }, { status: 400 });
        }

        // Check if user exists in Supabase
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json({ message: 'Este correo ya está registrado' }, { status: 400 });
        }

        const hashedPassword = await hash(password, 12);

        const { error } = await supabase
            .from('users')
            .insert({
                name: name || 'Nuevo Administrador',
                email,
                password_hash: hashedPassword,
                role: 'admin',
                plan: 'pro', // Admins usually get pro plan
                subscription_status: 'active'
            });

        if (error) throw error;

        return NextResponse.json({ message: 'Nuevo administrador creado con éxito' }, { status: 201 });
    } catch (error: any) {
        console.error('[ADMIN_CREATE_ADMIN] Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

