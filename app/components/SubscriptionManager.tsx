'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Zap, Loader2, AlertTriangle, Check, X, Calendar, CreditCard, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSession } from 'next-auth/react';

interface SubscriptionInfo {
    plan: string;
    status: string;
    subscriptionEndDate: string | null;
    cancelAtPeriodEnd: boolean;
    currentPeriodStart?: string;
}

export default function SubscriptionManager({ onUpgrade }: { onUpgrade: () => void }) {
    const { data: session, update } = useSession();
    const [info, setInfo] = useState<SubscriptionInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/payments/stripe/subscription-status');
            if (res.ok) {
                const data = await res.json();
                setInfo(data);
            }
        } catch (e) {
            console.error('Error fetching subscription:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleCancel = async () => {
        setCancelling(true);
        try {
            const res = await fetch('/api/payments/stripe/cancel-subscription', {
                method: 'POST'
            });
            const data = await res.json();
            if (res.ok) {
                setNotification('✅ ' + data.message);
                setShowConfirm(false);
                await fetchStatus();
                await update({ subscriptionStatus: 'active' }); // still active until period end
            } else {
                setNotification('❌ ' + (data.error || 'Error al cancelar'));
            }
        } catch (e) {
            setNotification('❌ Error de conexión');
        } finally {
            setCancelling(false);
        }
    };

    const planLabels: Record<string, { name: string; icon: typeof Zap; color: string }> = {
        premium: { name: 'Premium', icon: Zap, color: 'text-info' },
        fleet: { name: 'Flotilla', icon: Crown, color: 'text-purple-400' },
        free: { name: 'Gratuito', icon: Shield, color: 'text-white/40' }
    };

    const currentPlan = planLabels[info?.plan || 'free'] || planLabels.free;
    const Icon = currentPlan.icon;
    const isActive = info?.status === 'active' || info?.status === 'trialing';

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-info animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-info/10 border border-info/20 rounded-2xl text-info text-xs font-bold"
                        onAnimationComplete={() => setTimeout(() => setNotification(null), 4000)}
                    >
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Current Plan Card */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] relative overflow-hidden">
                <div className={cn("absolute -top-8 -right-8 w-32 h-32 blur-[60px] opacity-20", currentPlan.color.replace('text-', 'bg-'))} />

                <div className="flex items-center gap-4 mb-6">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", info?.plan === 'free' ? "bg-white/5" : "bg-info/10")}>
                        <Icon className={cn("w-7 h-7", currentPlan.color)} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Tu Plan Actual</p>
                        <h3 className={cn("text-2xl font-black italic tracking-tighter uppercase", currentPlan.color)}>
                            {currentPlan.name}
                        </h3>
                    </div>
                    {isActive && !info?.cancelAtPeriodEnd && (
                        <div className="ml-auto px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Activo</span>
                        </div>
                    )}
                    {info?.cancelAtPeriodEnd && (
                        <div className="ml-auto px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
                            <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Cancelando</span>
                        </div>
                    )}
                </div>

                {info?.subscriptionEndDate && (
                    <div className="flex items-center gap-3 p-4 bg-dark/40 rounded-2xl border border-white/5 mb-4">
                        <Calendar className="w-4 h-4 text-info/40 shrink-0" />
                        <div>
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                                {info.cancelAtPeriodEnd ? 'Se cancela el' : 'Próxima renovación'}
                            </p>
                            <p className="text-sm font-bold text-white/80">
                                {new Date(info.subscriptionEndDate).toLocaleDateString('es-MX', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                )}

                {info?.plan === 'free' && (
                    <div className="p-4 bg-info/5 border border-info/10 rounded-2xl mb-4">
                        <p className="text-xs text-white/50 leading-relaxed">
                            Plan gratuito: <span className="text-info font-bold">10 paradas máximo</span>. Actualiza a Premium para paradas ilimitadas y optimización con tráfico real.
                        </p>
                    </div>
                )}

                <div className="flex gap-3">
                    {info?.plan === 'free' ? (
                        <button
                            onClick={onUpgrade}
                            className="flex-1 py-4 bg-info text-dark text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-info/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Zap className="w-4 h-4" />
                            Ser Premium — $199/mes
                        </button>
                    ) : !info?.cancelAtPeriodEnd ? (
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="flex-1 py-4 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 border border-white/5 hover:border-red-500/20 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Cancelar Suscripción
                        </button>
                    ) : (
                        <div className="flex-1 py-4 text-center text-amber-400 text-[10px] font-black uppercase tracking-widest">
                            Tu plan se mantendrá activo hasta la fecha indicada
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Security Badge */}
            <div className="flex items-center justify-center gap-4 opacity-30">
                <CreditCard className="w-3.5 h-3.5" />
                <span className="text-[8px] font-black uppercase tracking-widest">Pagos seguros con Stripe</span>
                <Shield className="w-3.5 h-3.5" />
            </div>

            {/* Cancel Confirmation */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[400] flex items-center justify-center p-6"
                    >
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
                        <div className="relative bg-[#0a0a0a] border border-red-500/20 rounded-[40px] p-8 max-w-sm w-full shadow-2xl">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-black text-white text-center italic uppercase tracking-tight mb-3">
                                ¿Cancelar y perder beneficios?
                            </h3>

                            <p className="text-xs text-white/40 text-center leading-relaxed mb-8">
                                ¿Estás seguro que quieres cancelar y perder tus beneficios premium (paradas ilimitadas, optimización inteligente)? Tus rutas volverán a estar limitadas a un máximo de 10 paradas al final de tu periodo actual.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-4 bg-white/5 text-white/60 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                    Mantener Plan
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sí, Cancelar'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
