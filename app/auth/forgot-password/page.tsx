'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setSent(true);
            } else {
                setError(data.error || 'Ocurrió un error. Intenta de nuevo.');
            }
        } catch {
            setError('Error de conexión. Por favor intenta más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden" suppressHydrationWarning>
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px] relative z-10"
            >
                {/* Logo Section */}
                <div className="mb-8 text-center flex flex-col items-center">
                    <div className="relative mb-6 group">
                        <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full group-hover:bg-primary/40 transition-all duration-500" />
                        <div className="relative w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center p-5 backdrop-blur-md shadow-2xl">
                            <img src="/LogoHormiruta.png" alt="Hormiruta" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Recuperar Contraseña</h1>
                    <p className="text-slate-400 text-xs font-medium mt-2">
                        {sent ? 'Revisa tu correo electrónico' : 'Ingresa tu correo registrado'}
                    </p>
                </div>

                <div className="glass-panel p-8 space-y-6">
                    {sent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-4"
                        >
                            <div className="flex justify-center">
                                <CheckCircle2 className="w-16 h-16 text-green-400" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-white font-bold text-lg">¡Correo enviado!</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Si el correo <span className="text-accent font-bold">{email}</span> está registrado,
                                    recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                                </p>
                                <p className="text-slate-500 text-xs">
                                    Revisa también tu carpeta de spam.
                                </p>
                            </div>
                            <Link
                                href="/auth/login"
                                className="block w-full py-3 btn-primary text-sm font-bold text-center mt-4"
                            >
                                Volver al inicio de sesión
                            </Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-300 ml-1 uppercase">
                                    Correo electrónico
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ejemplo@hormiruta.com"
                                        className="w-full input-premium py-3 pl-10 pr-4 text-sm"
                                        required
                                        autoFocus
                                    />
                                </div>
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
                                disabled={loading || !email}
                                className="w-full py-3.5 btn-primary text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    'Enviar enlace de recuperación'
                                )}
                            </button>

                            <Link
                                href="/auth/login"
                                className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors text-sm pt-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Volver al inicio de sesión
                            </Link>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
