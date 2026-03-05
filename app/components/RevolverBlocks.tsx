'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface RevolverBlocksProps {
    block1: React.ReactNode; // Acciones y Progreso
    block2: React.ReactNode; // Lista de Rutas
    block3?: React.ReactNode; // Contador de Progreso
    className?: string;
}

const RevolverBlocks = ({ block1, block2, block3, className }: RevolverBlocksProps) => {
    const totalBlocks = block3 ? 3 : 2;
    const [activeIndex, setActiveIndex] = useState(0);

    const handleNext = () => setActiveIndex((prev) => (prev + 1) % totalBlocks);
    const handlePrev = () => setActiveIndex((prev) => (prev - 1 + totalBlocks) % totalBlocks);

    const handleDragEnd = (_: any, info: any) => {
        const threshold = 50;
        if (info.offset.y < -threshold) {
            handleNext();
        } else if (info.offset.y > threshold) {
            handlePrev();
        }
    };

    const blocks = [block1, block2, ...(block3 ? [block3] : [])];
    const labels = ['Acciones', 'Lista', ...(block3 ? ['Progreso'] : [])];

    return (
        <div className={cn("relative w-full h-[400px] flex flex-col", className)}>
            {/* Control de Navegación Vertical (Indicador) */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                {blocks.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={cn(
                            "w-1 h-8 rounded-full transition-all duration-500 cursor-pointer hover:w-1.5",
                            activeIndex === idx
                                ? "bg-info shadow-[0_0_10px_rgba(49,204,236,0.5)]"
                                : "bg-white/10 hover:bg-white/20"
                        )}
                    />
                ))}
            </div>

            <motion.div
                className="flex-1 relative overflow-hidden"
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={activeIndex}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="w-full h-full"
                    >
                        {activeIndex === 0 ? (
                            <div className="h-full flex flex-col gap-6 pt-4">
                                <div className="flex-1 overflow-y-auto no-scrollbar pointer-events-none">
                                    {block1}
                                </div>
                                <button
                                    onClick={handleNext}
                                    className="mt-auto mx-auto p-4 bg-white/5 rounded-full text-white/20 hover:text-info hover:bg-info/10 transition-all group pointer-events-auto"
                                >
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] block mb-1">{labels[(activeIndex + 1) % totalBlocks]}</span>
                                    <ChevronDown className="w-5 h-5 mx-auto group-hover:translate-y-1 transition-transform" />
                                </button>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col gap-4 pt-4">
                                <button
                                    onClick={handlePrev}
                                    className="mx-auto p-2 bg-white/5 rounded-full text-white/20 hover:text-info hover:bg-info/10 transition-all group flex items-center gap-2 px-4 pointer-events-auto"
                                >
                                    <ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">{labels[(activeIndex - 1 + totalBlocks) % totalBlocks]}</span>
                                </button>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pointer-events-auto">
                                    {blocks[activeIndex]}
                                </div>
                                {activeIndex < totalBlocks - 1 && (
                                    <button
                                        onClick={handleNext}
                                        className="mx-auto p-2 bg-white/5 rounded-full text-white/20 hover:text-info hover:bg-info/10 transition-all group flex items-center gap-2 px-4 pointer-events-auto"
                                    >
                                        <span className="text-[8px] font-black uppercase tracking-[0.3em]">{labels[(activeIndex + 1) % totalBlocks]}</span>
                                        <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default RevolverBlocks;
