import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcryptjs';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token y contraseña son requeridos.' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
        }

        // Find user with valid, non-expired token
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, email, reset_token_expiry')
            .eq('reset_token', token)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'El enlace no es válido o ya fue utilizado.' }, { status: 400 });
        }

        // Check expiry
        const expiry = new Date(user.reset_token_expiry);
        if (expiry < new Date()) {
            // Clean up expired token
            await supabaseAdmin.from('users').update({
                reset_token: null,
                reset_token_expiry: null,
            }).eq('id', user.id);

            return NextResponse.json({ error: 'El enlace ha expirado. Por favor solicita uno nuevo.' }, { status: 400 });
        }

        // Hash new password
        const password_hash = await hash(password, 12);

        // Update password and clear token
        await supabaseAdmin
            .from('users')
            .update({
                password_hash,
                reset_token: null,
                reset_token_expiry: null,
            })
            .eq('id', user.id);

        console.log(`[RESET-PW] Password successfully reset for user: ${user.email}`);

        return NextResponse.json({ ok: true });

    } catch (error: any) {
        console.error('[RESET-PW] Error:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
