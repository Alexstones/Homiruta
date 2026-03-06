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

    const updateData: Record<string, any> = {};

    if (preferredMapApp !== undefined) {
      updateData.preferred_map_app = preferredMapApp;
    }

    if (vehicleType !== undefined) {
      updateData.vehicle_type = vehicleType;
    }

    if (sosContact !== undefined) {
      updateData.sos_contact = sosContact;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in users table' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Settings updated',
      user,
    });
  } catch (error) {
    console.error('[API_USER_SETTINGS] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}