import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { supabase } from '@/app/lib/supabaseClient';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { lat, lng, vehicleType } = await req.json();

        const updateData: any = {
            last_location: {
                lat,
                lng,
                updatedAt: new Date().toISOString()
            }
        };

        if (vehicleType) {
            updateData.vehicle_type = vehicleType;
        }

        const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', (session.user as any).id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[LOCATION_UPDATE_ERROR]:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Obtener usuarios activos en los últimos 10 minutos
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

        // Supabase query for JSONB date filtering
        const { data: drivers, error } = await supabase
            .from('users')
            .select('id, name, email, last_location, vehicle_type')
            .not('last_location', 'is', null)
            .gt('last_location->>updatedAt', tenMinutesAgo);

        if (error) throw error;

        return NextResponse.json(drivers);
    } catch (error) {
        console.error("[LOCATION_GET_ERROR]:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

