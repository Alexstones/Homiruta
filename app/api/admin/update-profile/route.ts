import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { supabase } from '@/app/lib/supabaseClient';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Security check: Only admins can update their profile here
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
        }

        const { newEmail, newPassword, newName } = await req.json();

        // Get current user data
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', (session.user as any).id)
            .single();

        if (fetchError || !user) {
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
        }

        const updateData: any = {};
        if (newName) updateData.name = newName;

        if (newEmail && newEmail !== user.email) {
            // Check if new email exists
            const { data: emailExists } = await supabase
                .from('users')
                .select('id')
                .eq('email', newEmail)
                .single();

            if (emailExists) {
                return NextResponse.json({ message: 'El nuevo correo ya está en uso' }, { status: 400 });
            }
            updateData.email = newEmail;
        }

        if (newPassword) {
            if (newPassword.length < 6) {
                return NextResponse.json({ message: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
            }
            updateData.password_hash = await hash(newPassword, 12);
        }

        const { error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id);

        if (updateError) throw updateError;

        return NextResponse.json({ message: 'Perfil actualizado con éxito' }, { status: 200 });
    } catch (error: any) {
        console.error('[ADMIN_UPDATE_PROFILE] Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

