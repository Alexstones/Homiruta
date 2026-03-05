import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { supabase } from '@/app/lib/supabaseClient';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', (session.user as any).id)
            .single();

        if (error || !user || !user.stripe_subscription_id) {
            return NextResponse.json({ error: 'No se encontró suscripción activa' }, { status: 404 });
        }

        // Cancel at end of current billing period
        const subscription = await stripe.subscriptions.update(user.stripe_subscription_id, {
            cancel_at_period_end: true
        }) as any;

        return NextResponse.json({
            status: 'cancelling',
            cancelAt: new Date(subscription.current_period_end * 1000).toISOString(),
            message: 'Tu suscripción se cancelará al final del periodo actual.'
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('STRIPE CANCEL ERROR:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

