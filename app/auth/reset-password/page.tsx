'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            return;
        }
        // Token present — we validate on submit, not on load (to avoid leaking validity)
        setTokenValid(true);
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || 'El enlace expiró o no es válido. Solicita uno nuevo.');
            }
        } catch {
            setError('Error de conexión. Por favor intenta más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden" suppressHydrationWarning>
            <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px] relative z-10"
            >
                <div className="mb-8 text-center flex flex-col items-center">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
                        <div className="relative w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center p-5 backdrop-blur-md shadow-2xl">
                            <img src="/LogoHormiruta.png" alt="Hormiruta" className="w-full h-full object-contain" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Nueva Contraseña</h1>
                    <p className="text-slate-400 text-xs font-medium mt-2">Elige una contraseña segura</p>
                </div>

                <div className="glass-panel p-8 space-y-6">
                    {tokenValid === false ? (
                        <div className="text-center space-y-4">
                            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto" />
                            <h2 className="text-white font-bold">Enlace inválido</h2>
                            <p className="text-slate-400 text-sm">
                                Este enlace no es válido o ya expiró. Por favor solicita uno nuevo.
                            </p>
                            <Link href="/auth/forgot-password" className="block w-full py-3 btn-primary text-sm font-bold text-center">
                                Solicitar nuevo enlace
                            </Link>
                        </div>
                    ) : success ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
                            <h2 className="text-white font-bold text-lg">¡Contraseña actualizada!</h2>
                            <p className="text-slate-400 text-sm">Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.</p>
                            <Link href="/auth/login" className="block w-full py-3 btn-primary text-sm font-bold text-center">
                                Iniciar sesión
                            </Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-300 ml-1 uppercase">Nueva contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mínimo 8 caracteres"
                                        className="w-full input-premium py-3 pl-10 pr-4 text-sm"
                                        required
                                        minLength={8}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-300 ml-1 uppercase">Confirmar contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repite la contraseña"
                                        className="w-full input-premium py-3 pl-10 pr-4 text-sm"
                                        required
                                    />
                                </div>
                                {/* Password strength visual */}
                                {password.length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all ${password.length > i * 3
                                                    ? i < 1 ? 'bg-red-500' : i < 2 ? 'bg-yellow-500' : i < 3 ? 'bg-blue-500' : 'bg-green-500'
                                                    : 'bg-white/10'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-4"
                                >
                                    {error}
                                </motion.p>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !password || !confirmPassword}
                                className="w-full py-3.5 btn-primary text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Restablecer contraseña'}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-info" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
