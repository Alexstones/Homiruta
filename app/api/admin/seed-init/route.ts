import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const adminEmail = 'admin@hormiruta.com';

        const { data: envCheck } = await supabase.from('users').select('id').limit(1);

        // Si el cliente está usando el placeholder, fallará
        if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
            return NextResponse.json({
                error: 'Ambiente no configurado',
                message: 'Las variables de Supabase no están configuradas en Vercel. Por favor agrégalas y haz un REDEPLOY.'
            }, { status: 500 });
        }

        const { data: existingAdmin, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('email', adminEmail)
            .single();

        if (existingAdmin) {
            return NextResponse.json({ message: 'Administrador ya inicializado' }, { status: 200 });
        }

        const hashedPassword = await hash('admin123', 12);

        const { error: insertError } = await supabase
            .from('users')
            .insert({
                name: 'Administrador Maestro',
                email: adminEmail,
                password_hash: hashedPassword,
                role: 'admin',
                plan: 'pro',
                subscription_status: 'active'
            });

        if (insertError) throw insertError;

        return NextResponse.json({
            message: 'Administrador inicializado con éxito',
            credentials: {
                email: 'admin@hormiruta.com',
                password: 'admin123'
            }
        }, { status: 201 });
    } catch (error: any) {
        console.error('[ADMIN_SEED_INIT] Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

