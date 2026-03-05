import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// --- SISTEMA DE CONTROL DE TRÁFICO (Rate Limiting) ---
const ipCache = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT = 30; // Slightly increased for development
const WINDOW_MS = 60 * 1000;

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = ipCache.get(ip);
    if (!record || now > record.resetTime) {
        ipCache.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        return false;
    }
    record.count++;
    return record.count > RATE_LIMIT;
}

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const query = req.nextUrl.search;
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    // 1. SISTEMA DE BLINDAJE (WAF) - Activo para TODOS los visitantes
    const maliciousPatterns = [
        /<script/i,
        /UNION SELECT/i,
        /\.\.\//,
        /etc\/passwd/i
    ];
    const isMalicious = maliciousPatterns.some(pattern =>
        pattern.test(decodeURIComponent(path)) || pattern.test(decodeURIComponent(query))
    );

    if (isMalicious) {
        console.error(`[SECURITY_SHIELD] Bloqueo de petición sospechosa en ${path} desde IP: ${ip}`);
        return new NextResponse(null, { status: 403 });
    }

    // 2. RATE LIMITING PARA RUTAS SENSIBLES - Activo para TODOS los visitantes
    if (path.startsWith('/api/auth') || path.startsWith('/api/register')) {
        if (isRateLimited(ip)) {
            console.warn(`[SECURITY_BRUTEFORCE] Bloqueo por exceso de peticiones desde IP: ${ip} en ${path}`);
            return new NextResponse(JSON.stringify({ error: 'Demasiadas peticiones. Intenta más tarde.' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // 3. CONTROL DE ACCESO (PROTECCIÓN DE RUTAS)
    // Definimos qué rutas requieren login
    const isProtectedPath =
        path.startsWith('/dashboard') ||
        path.startsWith('/admin') ||
        (path.startsWith('/api/admin') && !path.includes('seed-init'));

    if (isProtectedPath) {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET
        });

        if (!token) {
            console.log(`[AUTH_BLOCK] Unauthenticated access to ${path}.`);

            // If it's an API route, return 401 JSON instead of a redirect
            if (path.startsWith('/api/')) {
                return new NextResponse(
                    JSON.stringify({ error: 'No autorizado. Por favor inicia sesión.' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            }

            const url = req.nextUrl.clone();
            url.pathname = '/auth/login';
            url.searchParams.set('callbackUrl', path);
            return NextResponse.redirect(url);
        }

        console.log(`[ACCESS] AUTH_USER(${token.email}) -> ${path}`);
    } else {
        // console.log(`[ACCESS] GUEST -> ${path}`);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/admin/:path*",
        "/api/admin/:path*",
        "/api/register",
        "/api/auth/:path*"
    ]
}
