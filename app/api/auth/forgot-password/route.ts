import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
        }

        // Check if user exists
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('id, email, name')
            .eq('email', email.toLowerCase().trim())
            .single();

        // SECURITY: Always return 200 even if user doesn't exist (prevents email enumeration)
        if (!user) {
            console.log(`[FORGOT-PW] Email not found: ${email} — returning 200 for security`);
            return NextResponse.json({ ok: true });
        }

        // Generate a secure reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Save token to DB
        await supabaseAdmin
            .from('users')
            .update({
                reset_token: token,
                reset_token_expiry: expiry.toISOString(),
            })
            .eq('id', user.id);

        const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

        // Send email using a simple fetch to a transactional email service
        // Using Resend (if RESEND_API_KEY is set) or log to console for development
        if (process.env.RESEND_API_KEY) {
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'HormiRuta <noreply@hormiruta.app>',
                    to: user.email,
                    subject: 'Recupera tu contraseña — HormiRuta',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #132533; color: #f1f5f9; padding: 40px; border-radius: 16px;">
                            <div style="text-align: center; margin-bottom: 32px;">
                                <h1 style="font-size: 28px; font-weight: 900; color: #06b6d4; margin: 0;">HORMIRUTA</h1>
                                <p style="color: #94a3b8; font-size: 14px; margin-top: 8px;">Sistema de Gestión Logística</p>
                            </div>
                            <h2 style="font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 16px;">Recupera tu contraseña</h2>
                            <p style="color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
                                Hola <strong style="color: #f1f5f9;">${user.name || 'usuario'}</strong>,<br /><br />
                                Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                                Haz clic en el botón de abajo para crear una nueva contraseña.
                                Este enlace expirará en <strong style="color: #06b6d4;">1 hora</strong>.
                            </p>
                            <div style="text-align: center; margin-bottom: 32px;">
                                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; font-weight: 700; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 16px;">
                                    Restablecer contraseña
                                </a>
                            </div>
                            <p style="color: #64748b; font-size: 12px; text-align: center;">
                                Si no solicitaste esto, ignora este mensaje. Tu cuenta está segura.<br />
                                El link expira el ${expiry.toLocaleString('es-MX')}.
                            </p>
                            <hr style="border-color: rgba(255,255,255,0.05); margin: 24px 0;" />
                            <p style="color: #475569; font-size: 11px; text-align: center;">HormiRuta Technologies — Todos los derechos reservados</p>
                        </div>
                    `,
                }),
            });
        } else {
            // Development fallback — log the link
            console.log(`\n[FORGOT-PW] ===== RESET LINK (no email provider configured) =====`);
            console.log(`To: ${user.email}`);
            console.log(`Link: ${resetUrl}`);
            console.log(`Expires: ${expiry.toISOString()}`);
            console.log(`=============================================================\n`);
        }

        return NextResponse.json({ ok: true });

    } catch (error: any) {
        console.error('[FORGOT-PW] Error:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
