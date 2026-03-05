import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', (session.user as any).id)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // If no stripe subscription, return current info from DB
        if (!user.stripe_subscription_id) {
            return NextResponse.json({
                plan: user.plan || 'free',
                status: user.subscription_status || 'none',
                subscriptionEndDate: user.subscription_end_date,
                cancelAtPeriodEnd: false
            });
        }

        // Fetch live status from Stripe
        const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id) as any;

        // Sync status to DB
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        const updatedStatus = isActive ? 'active' : 'expired';
        const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();

        const updateData: any = {
            subscription_status: updatedStatus,
            subscription_end_date: subscriptionEndDate
        };

        if (!isActive && user.plan !== 'free') {
            updateData.plan = 'free';
        }

        await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id);

        return NextResponse.json({
            plan: updateData.plan || user.plan,
            status: subscription.status,
            subscriptionEndDate: subscriptionEndDate,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString()
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('SUBSCRIPTION STATUS ERROR:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

