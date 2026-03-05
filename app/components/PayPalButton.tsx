'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { Loader2 } from 'lucide-react';

interface PayPalButtonProps {
    hostedButtonId: string;
    clientId: string;
}

export default function PayPalButton({ hostedButtonId, clientId }: PayPalButtonProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoaded && containerRef.current && (window as any).paypal) {
            try {
                // Clear container before rendering
                if (containerRef.current.innerHTML === '') {
                    (window as any).paypal.HostedButtons({
                        hostedButtonId: hostedButtonId,
                    }).render(`#${containerRef.current.id}`);
                }
            } catch (err) {
                console.error('PayPal Render Error:', err);
                setError('Error al cargar el botón de PayPal');
            }
        }
    }, [isLoaded, hostedButtonId]);

    const containerId = `paypal-container-${hostedButtonId}`;

    return (
        <div className="w-full flex flex-col items-center">
            <Script
                src={`https://www.paypal.com/sdk/js?client-id=${clientId}&components=hosted-buttons&disable-funding=venmo&currency=MXN`}
                onLoad={() => setIsLoaded(true)}
                onError={() => setError('No se pudo cargar el SDK de PayPal')}
            />

            {!isLoaded && !error && (
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin text-info" />
                </div>
            )}

            {error && (
                <p className="text-red-500 text-xs text-center py-2">{error}</p>
            )}

            <div
                id={containerId}
                ref={containerRef}
                className="w-full"
            ></div>
        </div>
    );
}
