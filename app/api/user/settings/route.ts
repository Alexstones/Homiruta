import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { supabase } from '@/app/lib/supabaseClient';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { preferredMapApp, vehicleType, sosContact } = body;

        const updateData: any = {};
        if (preferredMapApp) updateData.preferred_map_app = preferredMapApp;
        if (vehicleType) updateData.vehicle_type = vehicleType;
        if (sosContact) updateData.sos_contact = sosContact;

        const { data: user, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', (session.user as any).id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ message: 'Settings updated', user });
    } catch (error) {
        console.error('[API_USER_SETTINGS] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

