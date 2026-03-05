'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Globe, ChevronLeft, MapPin, CreditCard, Mail, UserCheck, Database, FileText, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
    const router = useRouter();

    const sections = [
        {
            icon: UserCheck,
            title: "Identidad del Responsable",
            content: "HormiRuta, operado por Jandosoft, con domicilio en México, es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento."
        },
        {
            icon: Database,
            title: "Datos Personales Recabados",
            content: "Recabamos los siguientes datos: nombre completo, correo electrónico, número telefónico, ubicación GPS en tiempo real (solo durante uso activo de navegación), dirección IP, datos de pago (procesados exclusivamente por Stripe, sin almacenamiento local), historial de rutas y paradas, tipo de vehículo, y datos de contacto de emergencia (SOS)."
        },
        {
            icon: MapPin,
            title: "Datos de Ubicación y Geolocalización",
            content: "Recopilamos su ubicación precisa en segundo plano solo cuando la aplicación está en modo activo de navegación. Estos datos son vitales para calcular tiempos de llegada, activar alertas de geovalla (geofencing), y optimizar sus rutas logísticas en tiempo real. Los datos de ubicación se almacenan durante 24 horas y posteriormente son anonimizados."
        },
        {
            icon: Eye,
            title: "Finalidades del Tratamiento",
            content: "Sus datos son utilizados para: (1) Optimización inteligente de rutas de entrega y recolección, (2) Cálculo de tiempos estimados de llegada, (3) Funcionalidad de seguimiento de flota ('Monillos'), (4) Procesamiento de suscripciones y pagos, (5) Envío de alertas de emergencia SOS, (6) Mejora continua de nuestros algoritmos, (7) Comunicación de actualizaciones del servicio."
        },
        {
            icon: CreditCard,
            title: "Seguridad Financiera",
            content: "Los pagos son procesados íntegramente por Stripe, Inc. HormiRuta NUNCA almacena, procesa ni tiene acceso a números de tarjeta de crédito, CVV o datos bancarios. Solo recibimos confirmación de transacciones exitosas y el identificador de suscripción. La suscripción mensual de $199 MXN es recurrente y puede cancelarse en cualquier momento desde la sección 'Mi Suscripción' en Configuración."
        },
        {
            icon: Shield,
            title: "Medidas de Seguridad",
            content: "Implementamos cifrado AES-256 para datos en reposo, comunicaciones protegidas mediante TLS 1.3, autenticación de dos factores disponible, monitoreo continuo de accesos, y políticas de retención mínima de datos. Sus datos nunca serán vendidos a terceros para fines publicitarios o de marketing."
        },
        {
            icon: Globe,
            title: "Transferencias de Datos",
            content: "Sus datos pueden ser transferidos a: Stripe Inc. (procesamiento de pagos, EE.UU.), Google Cloud Platform (alojamiento de servidores), Supabase (base de datos). Todas las transferencias cumplen con estándares internacionales de protección de datos y cuentan con acuerdos de confidencialidad."
        },
        {
            icon: Lock,
            title: "Derechos ARCO",
            content: "Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales (derechos ARCO). Para ejercer estos derechos, envíe su solicitud a soporte@hormiruta.com indicando su nombre completo, correo registrado en la plataforma, y la descripción clara del derecho que desea ejercer. Responderemos en un plazo máximo de 20 días hábiles."
        }
    ];

    return (
        <div className="min-h-screen bg-[#0B1121] text-white p-6 lg:p-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-info/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-16">
                    <button
                        onClick={() => router.back()}
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2 group"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Volver</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-info/20 rounded-2xl flex items-center justify-center p-2 border border-info/30 shadow-lg shadow-info/10">
                            <img src="/LogoHormiruta.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tighter uppercase">Privacidad</h1>
                            <p className="text-[10px] text-info font-bold uppercase tracking-[0.3em]">Aviso de Privacidad Integral</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-card p-10 lg:p-16 space-y-12 backdrop-blur-3xl border border-white/10"
                >
                    <div className="space-y-4">
                        <div className="inline-block px-4 py-1.5 bg-info/10 border border-info/20 rounded-full">
                            <span className="text-[10px] font-black text-info uppercase tracking-widest">Última actualización: Marzo 2026</span>
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tight uppercase leading-none">Aviso de Privacidad <br /><span className="text-info">Integral</span></h2>
                    </div>

                    <p className="text-white/40 text-sm leading-relaxed max-w-2xl">
                        En HormiRuta, entendemos que su información logística es el corazón de su negocio. Nos comprometemos a proteger cada coordenada y cada dato personal con los más altos estándares de seguridad tecnológica. Este aviso de privacidad describe cómo recopilamos, usamos y protegemos su información de acuerdo con la legislación mexicana vigente.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 bg-white/5 border border-white/5 rounded-[32px] hover:border-info/20 transition-all group"
                            >
                                <div className="w-12 h-12 bg-info/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <section.icon className="w-6 h-6 text-info" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-tight mb-3 text-white">
                                    {section.title}
                                </h3>
                                <p className="text-white/30 text-xs leading-relaxed font-medium">
                                    {section.content}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Consent Section */}
                    <div className="p-8 bg-info/5 border border-info/20 rounded-[32px]">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-info shrink-0 mt-1" />
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight mb-3 text-white">Consentimiento</h3>
                                <p className="text-white/40 text-xs leading-relaxed">
                                    Al registrarse y utilizar HormiRuta, usted otorga su consentimiento expreso para el tratamiento de sus datos personales conforme a lo descrito en este Aviso de Privacidad. Si no está de acuerdo con alguna de las finalidades descritas, puede solicitar la revocación de su consentimiento enviando un correo a soporte@hormiruta.com.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                <Mail className="w-5 h-5 text-info" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Datos Personales y ARCO:</p>
                                <p className="text-base font-black text-white italic">soporte@hormiruta.com</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link
                                href="/terms"
                                className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">Términos y Condiciones</span>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Copy */}
                <p className="text-center mt-12 text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">
                    Cuidamos tus datos. HormiRuta © {new Date().getFullYear()} — Jandosoft.
                </p>
            </div>
        </div>
    );
}
