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

        const { planId } = await req.json();

        // Map plan to Stripe price
        const priceMap: Record<string, { priceId: string; amount: number }> = {
            premium: {
                priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_199',
                amount: 19900
            },
            fleet: {
                priceId: process.env.STRIPE_FLEET_PRICE_ID || 'price_fleet_899',
                amount: 89900
            }
        };

        const plan = priceMap[planId];
        if (!plan) {
            return NextResponse.json({ error: 'Plan inválido' }, { status: 400 });
        }

        // Get user from Supabase
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', (session.user as any).id)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Create or retrieve Stripe Customer
        let customerId = user.stripe_customer_id;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name || undefined,
                metadata: { userId: user.id }
            });
            customerId = customer.id;

            await supabase
                .from('users')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id);
        }

        // Create the subscription
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: plan.priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: {
                save_default_payment_method: 'on_subscription',
            },
            expand: ['latest_invoice.payment_intent'],
            metadata: { planId, userId: user.id }
        }) as any;

        const invoice = subscription.latest_invoice as any;
        const paymentIntent = invoice?.payment_intent as any;

        // Update user in Supabase with subscription info
        const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();

        await supabase
            .from('users')
            .update({
                stripe_subscription_id: subscription.id,
                plan: planId,
                subscription_status: subscription.status === 'active' ? 'active' : 'pending',
                subscription_end_date: subscriptionEndDate
            })
            .eq('id', user.id);

        return NextResponse.json({
            subscriptionId: subscription.id,
            clientSecret: paymentIntent?.client_secret || null,
            status: subscription.status
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('STRIPE SUBSCRIPTION ERROR:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

