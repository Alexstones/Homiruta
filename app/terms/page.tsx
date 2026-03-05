'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, ChevronLeft, Scale, Users, Globe, CreditCard, AlertTriangle, Ban, Gavel, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
    const router = useRouter();

    const sections = [
        {
            icon: FileText,
            title: "Descripción del Servicio",
            content: "HormiRuta es una plataforma SaaS de optimización de rutas logísticas que permite a conductores y empresas de reparto planificar, optimizar y ejecutar sus entregas de forma eficiente. El servicio incluye optimización con tráfico en tiempo real, seguimiento GPS, alertas de geovalla, y herramientas de gestión de flota."
        },
        {
            icon: CreditCard,
            title: "Suscripciones y Facturación",
            content: "HormiRuta ofrece un plan gratuito (limitado a 10 paradas por ruta) y planes de suscripción mensual recurrente: Plan Premium ($199 MXN/mes) con paradas ilimitadas, y Plan Flotilla ($899 MXN/mes) con gestión multiusuario. El cobro se realiza automáticamente cada mes a través de Stripe. Los precios incluyen IVA. El primer cargo se realiza al momento de la suscripción."
        },
        {
            icon: RefreshCw,
            title: "Cancelación y Reembolsos",
            content: "Puede cancelar su suscripción en cualquier momento desde Configuración > Mi Suscripción. La cancelación será efectiva al final del periodo de facturación actual; usted mantendrá acceso completo hasta esa fecha. No se otorgan reembolsos por periodos parciales. Tras la cancelación, su cuenta regresará al plan gratuito con límite de 10 paradas."
        },
        {
            icon: Shield,
            title: "Uso Aceptable",
            content: "El usuario se compromete a utilizar HormiRuta exclusivamente para fines lícitos relacionados con logística y transporte. Queda prohibido: (a) usar el servicio para actividades ilegales, (b) intentar acceder a cuentas de otros usuarios, (c) realizar ingeniería inversa del software, (d) sobrecargar deliberadamente los servidores, (e) revender el acceso al servicio sin autorización."
        },
        {
            icon: Users,
            title: "Cuentas de Usuario",
            content: "Para acceder a ciertas funciones es necesario crear una cuenta. Usted es responsable de mantener la confidencialidad de sus credenciales y de todas las actividades que ocurran bajo su cuenta. Debe notificar inmediatamente cualquier uso no autorizado. Nos reservamos el derecho de suspender o terminar cuentas por violación de estos términos sin previo aviso."
        },
        {
            icon: Scale,
            title: "Propiedad Intelectual",
            content: "Todos los algoritmos de optimización de rutas, diseños de interfaz, logotipos, marcas registradas y código fuente son propiedad exclusiva de HormiRuta / Jandosoft. Queda prohibida la reproducción, distribución o modificación total o parcial del software sin autorización expresa por escrito. El usuario conserva la propiedad de sus datos ingresados (direcciones, contactos, rutas)."
        },
        {
            icon: AlertTriangle,
            title: "Limitación de Responsabilidad",
            content: "HormiRuta proporciona el servicio 'tal cual' (as-is). No garantizamos: (a) disponibilidad ininterrumpida del servicio, (b) precisión absoluta de las rutas optimizadas, (c) tiempos exactos de llegada. HormiRuta no será responsable por daños indirectos, pérdidas comerciales o retrasos causados por fallos técnicos, problemas de conectividad, o inexactitudes en los datos de Google Maps. La responsabilidad máxima se limita al monto pagado en el último mes de suscripción."
        },
        {
            icon: Globe,
            title: "Datos de Geolocalización",
            content: "Al utilizar funciones de navegación, usted consiente el rastreo de su ubicación en tiempo real para optimización de rutas y seguimiento de flota ('Monillos'). Los datos de ubicación se procesan en tiempo real y se anonimizan después de 24 horas de inactividad. Puede desactivar el seguimiento GPS en cualquier momento desde la configuración de su dispositivo."
        },
        {
            icon: Ban,
            title: "Terminación",
            content: "HormiRuta puede suspender o terminar su acceso al servicio inmediatamente si: (a) viola estos términos, (b) no realiza pagos por su suscripción, (c) utiliza el servicio para actividades fraudulentas. En caso de terminación, sus datos se conservarán por 30 días para posible recuperación, y posteriormente serán eliminados de forma irreversible."
        },
        {
            icon: Gavel,
            title: "Jurisdicción y Ley Aplicable",
            content: "Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia será sometida a los tribunales competentes de la Ciudad de México, renunciando a cualquier otro fuero que pudiera corresponderle por razón de domicilio presente, futuro o cualquier otra causa."
        },
        {
            icon: FileText,
            title: "Modificaciones",
            content: "Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones serán notificadas a través de la aplicación y/o por correo electrónico con al menos 15 días de anticipación. El uso continuado de la plataforma tras la fecha efectiva de los cambios constituye la aceptación de los nuevos términos."
        }
    ];

    return (
        <div className="min-h-screen bg-[#0B1121] text-white p-6 lg:p-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-info/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px]" />
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
                            <h1 className="text-2xl font-black italic tracking-tighter uppercase">Términos</h1>
                            <p className="text-[10px] text-info font-bold uppercase tracking-[0.3em]">Acuerdo Legal v2.5</p>
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
                        <h2 className="text-4xl font-black italic tracking-tight uppercase leading-none">Términos y Condiciones <br /><span className="text-info">del Servicio</span></h2>
                    </div>

                    <p className="text-white/40 text-sm leading-relaxed max-w-3xl">
                        Al acceder y utilizar la aplicación HormiRuta, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, le solicitamos no utilizar el servicio. Estos términos constituyen un acuerdo legal vinculante entre usted y Jandosoft (en adelante, &quot;HormiRuta&quot;).
                    </p>

                    <div className="grid grid-cols-1 gap-8">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className="flex gap-6 group"
                            >
                                <div className="shrink-0 w-14 h-14 bg-white/5 border border-white/10 rounded-[22px] flex items-center justify-center group-hover:bg-info/10 group-hover:border-info/30 transition-all">
                                    <section.icon className="w-6 h-6 text-white/40 group-hover:text-info transition-colors" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-lg font-black uppercase tracking-tight italic flex items-center gap-3">
                                        <span className="text-white/20 text-sm font-mono">{String(idx + 1).padStart(2, '0')}</span>
                                        {section.title}
                                        <div className="w-1.5 h-1.5 bg-info rounded-full shadow-[0_0_10px_rgba(49,204,236,1)]" />
                                    </h3>
                                    <p className="text-white/50 text-sm leading-relaxed font-medium">
                                        {section.content}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="pt-12 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
                        <div>
                            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-2">Para dudas legales:</p>
                            <a href="mailto:legal@hormiruta.com" className="text-lg font-black text-info italic hover:underline">legal@hormiruta.com</a>
                        </div>
                        <Link
                            href="/privacy"
                            className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 text-info" />
                                <span className="text-xs font-black uppercase tracking-widest">Aviso de Privacidad</span>
                            </div>
                        </Link>
                    </div>
                </motion.div>

                {/* Footer Copy */}
                <p className="text-center mt-12 text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">
                    Copyright © {new Date().getFullYear()} HormiRuta — Jandosoft. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}
