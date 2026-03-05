
import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/app/lib/paypal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req: Request) {
    try {
        const { orderID, plan } = await req.json();

        if (!orderID || !plan) {
            return NextResponse.json({ error: "Missing orderID or plan" }, { status: 400 });
        }

        // 1. Capture the payment
        const captureData = await capturePayPalOrder(orderID);

        // 2. If capture is successful, update the user plan
        if (captureData.status === "COMPLETED") {
            const session = await getServerSession(authOptions);

            if (session?.user) {
                const { data: user, error } = await supabase
                    .from('users')
                    .update({
                        plan: plan,
                        subscription_status: 'active'
                    })
                    .eq('id', (session.user as any).id)
                    .select('*')
                    .single();

                if (error) {
                    console.error(`[PAYMENT_SUCCESS] Supabase update error for ${session.user.email}:`, error);
                } else {
                    console.log(`[PAYMENT_SUCCESS] User ${session.user.email} upgraded to ${plan} in Supabase`);
                }

                return NextResponse.json({
                    success: true,
                    data: captureData,
                    userPlan: user?.plan || plan
                });
            } else {
                return NextResponse.json({
                    success: true,
                    data: captureData,
                    warning: "Payment successful but user session not found. Please contact support."
                });
            }
        }

        return NextResponse.json({ error: "Payment not completed" }, { status: 400 });

    } catch (error: any) {
        console.error("[PAYPAL_CAPTURE_ORDER_ERROR]:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

