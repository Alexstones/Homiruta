'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Zap, Shield, Rocket, ChevronRight, X } from 'lucide-react';

const STORAGE_KEY = 'hormiruta_onboarding_done';

const steps = [
    {
        icon: Rocket,
        color: 'from-info to-blue-600',
        title: '¡Bienvenido a HormiRuta!',
        desc: 'La plataforma logística definitiva para conductores y flotillas. Navega, optimiza y controla tus rutas profesionalmente.',
        tip: 'Usada por cientos de conductores en México 🚚',
    },
    {
        icon: MapPin,
        color: 'from-emerald-500 to-green-600',
        title: 'Añade tus paradas',
        desc: 'Usa el buscador para ingresar direcciones, o toca directamente en el mapa. También puedes escanear un QR o usar tu voz.',
        tip: 'Presiona el botón "+" para comenzar',
    },
    {
        icon: Zap,
        color: 'from-yellow-500 to-amber-600',
        title: 'Optimiza con un toque',
        desc: 'El algoritmo calcula el orden más eficiente usando tráfico en tiempo real, ahorrando combustible y tiempo en cada jornada.',
        tip: 'Hasta 40% menos tiempo en carretera ⚡',
    },
    {
        icon: Shield,
        color: 'from-red-500 to-rose-600',
        title: 'Botón SOS de emergencia',
        desc: 'Configura un contacto de emergencia. En caso de incidente, con un toque largo envías tu ubicación y una alerta inmediata.',
        tip: 'Tu seguridad es nuestra prioridad 🛡️',
    },
];

interface OnboardingTourProps {
    onComplete: () => void;
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
    const [step, setStep] = useState(0);
    const [exiting, setExiting] = useState(false);

    const finish = useCallback(() => {
        setExiting(true);
        localStorage.setItem(STORAGE_KEY, 'true');
        setTimeout(onComplete, 400);
    }, [onComplete]);

    const next = () => {
        if (step < steps.length - 1) {
            setStep(s => s + 1);
        } else {
            finish();
        }
    };

    const current = steps[step];
    const Icon = current.icon;

    return (
        <AnimatePresence>
            {!exiting && (
                <motion.div
                    key="onboarding"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
                    style={{ background: 'rgba(10, 18, 30, 0.96)', backdropFilter: 'blur(20px)' }}
                >
                    {/* Skip button */}
                    <button
                        onClick={finish}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-full max-w-sm">
                        {/* Step dots */}
                        <div className="flex justify-center gap-2 mb-10">
                            {steps.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setStep(i)}
                                    className={`rounded-full transition-all duration-300 ${i === step
                                        ? 'w-8 h-2 bg-info'
                                        : i < step
                                            ? 'w-2 h-2 bg-white/40'
                                            : 'w-2 h-2 bg-white/10'
                                        }`}
                                />
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.3 }}
                                className="text-center space-y-6"
                            >
                                {/* Icon */}
                                <div className="flex justify-center">
                                    <div className={`w-24 h-24 rounded-[32px] bg-gradient-to-br ${current.color} flex items-center justify-center shadow-2xl`}
                                        style={{ boxShadow: '0 20px 60px rgba(49,204,236,0.25)' }}>
                                        <Icon className="w-12 h-12 text-white" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-3">
                                    <h2 className="text-2xl font-black text-white tracking-tight">{current.title}</h2>
                                    <p className="text-white/50 text-sm leading-relaxed">{current.desc}</p>
                                </div>

                                {/* Tip chip */}
                                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full py-2 px-4">
                                    <span className="text-[11px] font-bold text-info/80">{current.tip}</span>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="mt-10 space-y-3">
                            <button
                                onClick={next}
                                className="w-full py-4 bg-gradient-to-r from-info to-blue-600 text-white font-black text-sm rounded-2xl shadow-[0_10px_40px_rgba(49,204,236,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {step < steps.length - 1 ? (
                                    <>
                                        Siguiente
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                ) : (
                                    '¡Comenzar ahora! 🚀'
                                )}
                            </button>

                            {step < steps.length - 1 && (
                                <button
                                    onClick={finish}
                                    className="w-full py-3 text-white/30 hover:text-white/60 text-xs font-bold uppercase tracking-widest transition-colors"
                                >
                                    Omitir tutorial
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Helper to check if onboarding should be shown (call this from dashboard)
export function shouldShowOnboarding(): boolean {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(STORAGE_KEY);
}
