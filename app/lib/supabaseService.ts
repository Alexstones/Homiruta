import { supabase } from './supabaseClient';

export async function ensureUserInSupabase(email: string) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (error && error.code === 'PGRST116') { // Not found
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({ email })
                .select('id')
                .single();

            if (createError) {
                console.error('[SUPABASE] Error creating user:', createError);
                return null;
            }
            return newUser?.id;
        }

        if (error) {
            console.error('[SUPABASE] Error fetching user:', error);
            return null;
        }

        return data?.id;
    } catch (err) {
        console.error('[SUPABASE] Unexpected error in ensureUserInSupabase:', err);
        return null;
    }
}

export async function recordSubscription(email: string, subscriptionId: string, status: string, periodEnd: Date) {
    try {
        const userId = await ensureUserInSupabase(email);
        if (!userId) return;

        const { error } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            status: status,
            current_period_end: periodEnd.toISOString()
        }, { onConflict: 'stripe_subscription_id' });

        if (error) {
            console.error('[SUPABASE] Error recording subscription:', error);
        }
    } catch (err) {
        console.error('[SUPABASE] Unexpected error in recordSubscription:', err);
    }
}

export async function recordPayment(email: string, paymentIntentId: string, amount: number, currency: string, status: string) {
    try {
        const userId = await ensureUserInSupabase(email);
        if (!userId) return;

        const { error } = await supabase.from('payments').insert({
            user_id: userId,
            stripe_payment_intent_id: paymentIntentId,
            amount: amount,
            currency: currency,
            status: status
        });

        if (error) {
            console.error('[SUPABASE] Error recording payment:', error);
        }
    } catch (err) {
        console.error('[SUPABASE] Unexpected error in recordPayment:', err);
    }
}
