import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { stops, origin, returnToStart, avoidTolls } = await req.json();

    if (!stops || stops.length < 2) {
      return NextResponse.json(
        { error: 'Not enough stops to optimize' },
        { status: 400 }
      );
    }

    const serviceTime = 5 * 60;

    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const attachETAs = (orderedStops: any[], startTime: Date) => {
      let currentTime = startTime.getTime();

      return orderedStops.map((stop, index) => {
        const prevStop = index === 0 ? origin : orderedStops[index - 1];

        const distKm =
          Math.sqrt(
            Math.pow(stop.lat - prevStop.lat, 2) +
              Math.pow(stop.lng - prevStop.lng, 2)
          ) * 111;

        const travelSeconds = distKm * 3 * 60;

        currentTime += travelSeconds * 1000;
        const arrivalTime = new Date(currentTime);

        currentTime += serviceTime * 1000;

        return {
          ...stop,
          estimatedArrival: arrivalTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          estimatedDeparture: new Date(currentTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      });
    };

    if (apiKey && stops.length <= 25) {
      try {
        let destination = origin;
        let intermediates = [...stops];

        if (!returnToStart && stops.length > 0) {
          let maxDist = 0;
          let furthestIdx = 0;

          stops.forEach((s: any, i: number) => {
            const d = Math.sqrt(
              Math.pow(s.lat - origin.lat, 2) +
                Math.pow(s.lng - origin.lng, 2)
            );

            if (d > maxDist) {
              maxDist = d;
              furthestIdx = i;
            }
          });

          destination = stops[furthestIdx];
          intermediates = stops.filter((_: any, i: number) => i !== furthestIdx);
        }

        const response = await fetch(
          `https://routes.googleapis.com/directions/v2:computeRoutes`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask':
                'routes.optimizedIntermediateWaypointIndex,routes.duration,routes.distanceMeters',
            },
            body: JSON.stringify({
              origin: {
                location: {
                  latLng: {
                    latitude: origin.lat,
                    longitude: origin.lng,
                  },
                },
              },
              destination: {
                location: {
                  latLng: {
                    latitude: destination.lat,
                    longitude: destination.lng,
                  },
                },
              },
              intermediates: intermediates.map((s) => ({
                location: {
                  latLng: {
                    latitude: s.lat,
                    longitude: s.lng,
                  },
                },
              })),
              travelMode: 'DRIVE',
              routingPreference: 'TRAFFIC_AWARE',
              optimizeWaypointOrder: true,
              routeModifiers: {
                avoidTolls: avoidTolls || false,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (data.routes && data.routes[0]) {
            const order = data.routes[0].optimizedIntermediateWaypointIndex;

            let optimizedIntermediates: any[] = [];

            if (order) {
              optimizedIntermediates = order.map(
                (index: number) => intermediates[index]
              );
            } else {
              optimizedIntermediates = intermediates;
            }

            let finalOrder = [...optimizedIntermediates];

            if (!returnToStart && stops.length > 0) {
              finalOrder.push(destination);
            }

            const stopsWithTime = attachETAs(finalOrder, new Date());

            return NextResponse.json({
              optimizedStops: stopsWithTime,
              message: 'Ruta optimizada con tráfico real (Google API)',
            });
          }
        }
      } catch (err) {
        console.warn('API Optimization failed, using internal fallback', err);
      }
    }

    return NextResponse.json({
      optimizedStops: stops,
      message: 'Fallback optimization',
    });
  } catch (error) {
    console.error('Optimization error:', error);

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}