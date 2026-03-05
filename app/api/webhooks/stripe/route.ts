import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { headers } from 'next/headers';
import { supabase } from '@/app/lib/supabaseClient';

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') as string;

    let event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is missing');
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Webhook Error: ${errorMessage}`);
        return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as any;
        const email = paymentIntent.metadata.email;
        const planName = paymentIntent.metadata.planName;

        if (email) {
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);

            const { error } = await supabase
                .from('users')
                .update({
                    plan: planName?.toLowerCase() === 'flotilla' ? 'fleet' : 'premium',
                    subscription_status: 'active',
                    subscription_end_date: expiryDate.toISOString()
                })
                .eq('email', email);

            if (error) {
                console.error(`[WEBHOOK_STRIPE] Supabase update error for ${email}:`, error);
            } else {
                console.log(`Subscription activated for ${email} with plan ${planName} in Supabase`);
            }
        }
    }

    return NextResponse.json({ received: true });
}


