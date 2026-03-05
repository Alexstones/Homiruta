import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { data: routes, error } = await supabase
            .from('routes')
            .select(`
                *,
                stops (*)
            `)
            .eq('user_id', (session.user as any).id)
            .order('date', { ascending: false });

        if (error) throw error;

        return NextResponse.json(routes);
    } catch (error: any) {
        console.error('Error fetching routes:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { name, date, stops, isOptimized, status, totalDistance, totalTime, startLocation } = await req.json();

        if (!name || !date || !stops) {
            return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 });
        }

        // 1. Insert Route
        const { data: route, error: routeError } = await supabase
            .from('routes')
            .insert({
                user_id: (session.user as any).id,
                name,
                date: new Date(date).toISOString().split('T')[0],
                is_optimized: !!isOptimized,
                status: status || 'active',
                total_distance: totalDistance || 0,
                total_time: totalTime || '',
                start_location: startLocation || null
            })
            .select()
            .single();

        if (routeError) throw routeError;

        // 2. Insert Stops
        if (stops && stops.length > 0) {
            const stopsToInsert = stops.map((stop: any, index: number) => ({
                route_id: route.id,
                address: stop.address,
                customer_name: stop.customerName || '',
                priority: stop.priority || 'NORMAL',
                time_window: stop.timeWindow || '',
                notes: stop.notes || '',
                lat: stop.lat,
                lng: stop.lng,
                is_completed: !!stop.isCompleted,
                is_failed: !!stop.isFailed,
                is_current: !!stop.isCurrent,
                order: stop.order !== undefined ? stop.order : index,
                locator: stop.locator || '',
                num_packages: stop.numPackages || 1,
                task_type: stop.taskType || 'DELIVERY',
                arrival_time_type: stop.arrivalTimeType || 'ANY',
                estimated_duration: stop.estimatedDuration || 10
            }));

            const { error: stopsError } = await supabase
                .from('stops')
                .insert(stopsToInsert);

            if (stopsError) throw stopsError;
        }

        return NextResponse.json(route, { status: 201 });
    } catch (error: any) {
        console.error('Error creating route:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { id, stops, status, totalDistance, totalTime } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'ID de ruta requerido' }, { status: 400 });
        }

        // 1. Update Route
        const { data: updatedRoute, error: routeError } = await supabase
            .from('routes')
            .update({
                status: status,
                total_distance: totalDistance,
                total_time: totalTime,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', (session.user as any).id)
            .select()
            .single();

        if (routeError) throw routeError;

        // 2. Update Stops (Simple way: Delete and Re-insert if requested)
        if (stops) {
            await supabase.from('stops').delete().eq('route_id', id);

            const stopsToInsert = stops.map((stop: any, index: number) => ({
                route_id: id,
                address: stop.address,
                customer_name: stop.customerName || '',
                priority: stop.priority || 'NORMAL',
                time_window: stop.timeWindow || '',
                notes: stop.notes || '',
                lat: stop.lat,
                lng: stop.lng,
                is_completed: !!stop.isCompleted,
                is_failed: !!stop.isFailed,
                is_current: !!stop.isCurrent,
                order: stop.order !== undefined ? stop.order : index,
                locator: stop.locator || '',
                num_packages: stop.numPackages || 1,
                task_type: stop.taskType || 'DELIVERY',
                arrival_time_type: stop.arrivalTimeType || 'ANY',
                estimated_duration: stop.estimatedDuration || 10
            }));

            const { error: stopsError } = await supabase.from('stops').insert(stopsToInsert);
            if (stopsError) throw stopsError;
        }

        return NextResponse.json(updatedRoute);
    } catch (error: any) {
        console.error('Error updating route:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

