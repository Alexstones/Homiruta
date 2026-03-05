import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

/**
 * SISTEMA DE SOPORTE SEGURO (Mecanismo de Diagnóstico)
 */
export async function POST(req: NextRequest) {
    const supportKey = req.headers.get('X-Support-Key');
    const masterKey = process.env.SUPPORT_MASTER_KEY;

    // Blindaje: Si no hay llave o no coincide, respondemos 401
    if (!masterKey || supportKey !== masterKey) {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        console.warn(`[SECURITY_ALERT] Intento de acceso no autorizado a Troubleshoot desde IP: ${ip}`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { action, targetEmail, targetPlan } = await req.json();

        switch (action) {
            case 'WAKE_DB':
                const { error: pingError } = await supabase.from('users').select('id', { count: 'exact', head: true });
                if (pingError) throw pingError;
                return NextResponse.json({ message: 'Supabase connection is alive' });

            case 'RESET_SUBSCRIPTION':
                if (!targetEmail) return NextResponse.json({ error: 'Email required' }, { status: 400 });
                const { data: resetUser, error: resetError } = await supabase
                    .from('users')
                    .update({
                        plan: 'free',
                        subscription_status: 'inactive',
                        subscription_end_date: null
                    })
                    .eq('email', targetEmail)
                    .select('email')
                    .single();

                if (resetError) throw resetError;
                return NextResponse.json({ message: 'Subscription reset', user: resetUser?.email });

            case 'FORCE_PREMIUM':
                if (!targetEmail) return NextResponse.json({ error: 'Email required' }, { status: 400 });
                const { data: promoUser, error: promoError } = await supabase
                    .from('users')
                    .update({
                        plan: targetPlan || 'premium',
                        subscription_status: 'active'
                    })
                    .eq('email', targetEmail)
                    .select('email')
                    .single();

                if (promoError) throw promoError;
                return NextResponse.json({ message: 'User updated successfully', user: promoUser?.email });

            case 'DUMP_USER_STATS':
                const { count, error: countError } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true });

                if (countError) throw countError;
                return NextResponse.json({ totalUsers: count });

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('[TROUBLESHOOT_ERROR]:', error);
        return NextResponse.json({ error: 'Error processing action', details: error.message }, { status: 500 });
    }
}

