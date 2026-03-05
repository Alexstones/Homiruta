import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { sosContact } = await req.json();

        if (!sosContact) {
            return NextResponse.json({ error: "Número de contacto requerido" }, { status: 400 });
        }

        if (sosContact.length < 10) {
            return NextResponse.json({ error: "Formato de número inválido" }, { status: 400 });
        }

        const { data: user, error } = await supabase
            .from('users')
            .update({ sos_contact: sosContact })
            .eq('id', (session.user as any).id)
            .select()
            .single();

        if (error || !user) {
            console.error("[API_SOS_UPDATE_ERROR] Supabase error:", error);
            return NextResponse.json({ error: "Usuario no encontrado o error en la base de datos" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Contacto SOS actualizado correctamente",
            sosContact: user.sos_contact
        });

    } catch (error) {
        console.error("[API_SOS_UPDATE_ERROR]", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

