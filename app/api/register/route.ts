import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { supabase } from '../../lib/supabaseClient';

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        // Validate basic input
        if (!email || !password || password.length < 6) {
            return NextResponse.json(
                { message: 'Datos inválidos. Verifica tu correo y contraseña (min 6 caracteres).' },
                { status: 400 }
            );
        }

        // Check if user exists in Supabase
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { message: 'Este correo ya está registrado.' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 12);

        // Create user in Supabase
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
                name,
                email,
                password_hash: hashedPassword,
                role: 'user',
                plan: 'free',
                subscription_status: 'none'
            })
            .select('*')
            .single();

        if (createError) {
            console.error('[AUTH] Supabase user creation error:', createError);
            return NextResponse.json(
                { message: 'Error al crear el usuario en la base de datos' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Usuario creado exitosamente', user: { id: newUser.id, email: newUser.email, name: newUser.name } },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { message: error.message || 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

