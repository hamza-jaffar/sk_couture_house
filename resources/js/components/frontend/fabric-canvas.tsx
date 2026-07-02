import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BG, BRASS, BRASS_L, FOREST, OXBLOOD, PARCH, WALNUT } from '@/constant/colors';
import type { FabricCanvasItem, FrontendData } from '@/types/auth';

/* Fixed metric colours — all stay within palette */
const metricColours: Record<string, string> = {
    rigidity: FOREST,
    breathability: '#6ba8a4',
    warmth: OXBLOOD,
    luster: BRASS_L,
};

// Accent colour cycle for dynamic cards
const ACCENT_CYCLES = [
    { accentHex: FOREST, accentHex2: '#2d6a45' },
    { accentHex: OXBLOOD, accentHex2: '#a03030' },
    { accentHex: WALNUT, accentHex2: '#7a4a22' },
    { accentHex: BRASS, accentHex2: BRASS_L },
    { accentHex: '#4a7c59', accentHex2: '#6ba8a4' },
];

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

type FabricCanvasProps = {
    fabricCanvases: FabricCanvasItem[];
    frontendData: FrontendData | null;
};

export const FabricCanvas: React.FC<FabricCanvasProps> = ({ fabricCanvases, frontendData }) => {
    const [activeIdx, setActiveIdx] = useState(0);

    const sectionTitle = frontendData?.fabric_canvas_title ?? 'The Fabric Canvas';

    // If no backend data yet, fall back to a minimal placeholder list
    const fabrics = fabricCanvases.length > 0 ? fabricCanvases : [];
    const af = fabrics[activeIdx] ?? null;
    const activeAccent = ACCENT_CYCLES[activeIdx % ACCENT_CYCLES.length];

    return (
        <section id="canvas" className="py-32 relative overflow-hidden"
            style={{ borderTop: `1px solid rgba(184,149,42,0.15)`, background: `linear-gradient(180deg, ${BG} 0%, #0d2010 50%, ${BG} 100%)` }}
        >
            {/* Dynamic ambient blob — changes with fabric */}
            <div className="absolute top-0 right-0 w-125 h-125 rounded-full pointer-events-none transition-all duration-1000"
                style={{ background: `radial-gradient(circle, ${activeAccent.accentHex}20 0%, transparent 65%)` }} />
            <div className="absolute bottom-0 left-0 w-100 h-100 rounded-full pointer-events-none transition-all duration-1000"
                style={{ background: `radial-gradient(circle, ${activeAccent.accentHex2}18 0%, transparent 65%)` }} />

            <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">

                {/* Section title */}
                <div className="mb-20 text-center md:text-left">
                    <span className="font-sans text-xs tracking-[0.4em] uppercase block mb-3 font-medium transition-all duration-700"
                        style={{ background: `linear-gradient(90deg, ${activeAccent.accentHex}, ${activeAccent.accentHex2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                        02 / TACTILE NODE
                    </span>
                    <h2 className="font-serif text-4xl md:text-5xl font-light uppercase tracking-wide" style={{ color: PARCH }}>
                        {sectionTitle}
                    </h2>
                </div>

                {fabrics.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-24 space-y-4"
                        style={{ border: `1px solid rgba(184,149,42,0.12)` }}
                    >
                        <div className="w-12 h-px" style={{ background: `linear-gradient(90deg, ${BRASS}, ${BRASS_L})` }} />
                        <p className="font-serif text-2xl font-light uppercase tracking-widest" style={{ color: `${PARCH}40` }}>
                            Fabrics Coming Soon
                        </p>
                        <p className="font-sans text-xs tracking-widest uppercase" style={{ color: `${PARCH}25` }}>
                            Add fabric canvases via the dashboard to display them here
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">

                        {/* Left: chips + description */}
                        <div className="lg:col-span-5 flex flex-col justify-between space-y-12">

                            {/* Fabric chips */}
                            <div className="space-y-4">
                                <span className="font-sans text-[10px] tracking-widest uppercase block mb-6" style={{ color: `${PARCH}40` }}>
                                    SELECT TEXTURE TO CANVAS
                                </span>
                                <div className="flex flex-wrap gap-3">
                                    {fabrics.map((f, idx) => {
                                        const active = idx === activeIdx;
                                        const acc = ACCENT_CYCLES[idx % ACCENT_CYCLES.length];
                                        return (
                                            <button key={f.id} onClick={() => setActiveIdx(idx)}
                                                className="text-xs uppercase tracking-widest px-5 py-3 cursor-pointer transition-all duration-500"
                                                style={active
                                                    ? { background: `linear-gradient(90deg, ${acc.accentHex}, ${acc.accentHex2})`, color: PARCH, border: `1px solid ${acc.accentHex}`, boxShadow: `0 0 18px ${acc.accentHex}50` }
                                                    : { background: 'transparent', color: `${acc.accentHex}CC`, border: `1px solid ${acc.accentHex}35` }
                                                }
                                            >
                                                {f.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Animated description + specs */}
                            {af && (
                                <div className="relative min-h-[300px] flex flex-col justify-end">
                                    <AnimatePresence mode="wait">
                                        <motion.div key={af.id}
                                            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                                            transition={{ duration: 0.5, ease }}
                                            className="space-y-8"
                                        >
                                            <div className="w-12 h-[2px] rounded" style={{ background: `linear-gradient(90deg, ${activeAccent.accentHex}, ${activeAccent.accentHex2})` }} />
                                            {af.desc && (
                                                <p className="font-serif text-xl md:text-2xl leading-relaxed font-light" style={{ color: `${PARCH}E6` }}>
                                                    "{af.desc}"
                                                </p>
                                            )}
                                            <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-6 font-sans text-xs uppercase tracking-wider"
                                                style={{ borderTop: `1px solid ${activeAccent.accentHex}25` }}
                                            >
                                                {[
                                                    { label: 'Origin Mill', value: af.origin_mill },
                                                    { label: 'Density / Weight', value: af.density_weight },
                                                    { label: 'Weave / Structure', value: af.structure, full: true },
                                                ].filter(r => r.value).map(({ label, value, full }) => (
                                                    <div key={label} className={full ? 'col-span-2' : ''}>
                                                        <span className="block text-[8px] tracking-[0.25em] mb-1" style={{ color: activeAccent.accentHex, opacity: 0.7 }}>{label.toUpperCase()}</span>
                                                        <span className="font-medium" style={{ color: PARCH }}>{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Right: animated weft schematic + metrics */}
                        {af && (
                            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center p-8 md:p-12 relative overflow-hidden backdrop-blur-md transition-all duration-700"
                                style={{ background: 'rgba(10,22,12,0.72)', border: `1px solid ${activeAccent.accentHex}25` }}
                            >
                                <div className="absolute inset-0 bg-grain pointer-events-none opacity-5" />
                                <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none transition-all duration-700"
                                    style={{ background: `radial-gradient(circle, ${activeAccent.accentHex}20 0%, transparent 70%)` }} />

                                {/* Warp/Weft Schematic */}
                                <div className="relative aspect-[4/5] w-full overflow-hidden p-6 flex flex-col justify-between shadow-2xl"
                                    style={{ border: `1px solid ${activeAccent.accentHex}30`, background: 'rgba(7,16,8,0.92)' }}
                                >
                                    <div>
                                        <span className="block text-[8px] tracking-[0.25em] uppercase mb-1" style={{ color: activeAccent.accentHex }}>YARN WEFT SCHEMATIC</span>
                                        <span className="block text-[10px] tracking-wider uppercase" style={{ color: `${PARCH}50` }}>
                                            {af.structure ? af.structure.toUpperCase() : 'Thread count: 260/inch — Active simulation'}
                                        </span>
                                    </div>

                                    <div className="w-full h-44 flex items-center justify-center overflow-hidden">
                                        <svg className="w-full h-full" viewBox="0 0 200 100" fill="none">
                                            {Array.from({ length: 20 }).map((_, i) => (
                                                <motion.line key={`wp-${i}`}
                                                    x1={10 + i * 9} y1={0} x2={10 + i * 9} y2={100}
                                                    stroke={activeAccent.accentHex}
                                                    strokeWidth="0.7"
                                                    animate={{ y1: [0, 4, 0], y2: [100, 96, 100] }}
                                                    transition={{ repeat: Infinity, duration: 3, delay: i * 0.1, ease: 'easeInOut' }}
                                                />
                                            ))}
                                            {Array.from({ length: 12 }).map((_, i) => (
                                                <motion.line key={`wf-${i}`}
                                                    x1={0} y1={10 + i * 7} x2={200} y2={10 + i * 7}
                                                    stroke={activeAccent.accentHex2}
                                                    strokeWidth="0.7"
                                                    animate={{ x1: [0, 6, 0], x2: [200, 194, 200] }}
                                                    transition={{ repeat: Infinity, duration: 4, delay: i * 0.12, ease: 'easeInOut' }}
                                                />
                                            ))}
                                            <rect x="35" y="33" width="130" height="34" fill="rgba(7,16,8,0.95)" stroke={activeAccent.accentHex} strokeWidth="0.6" />
                                            <text x="100" y="52" fill={activeAccent.accentHex} fontSize="6" letterSpacing="1" textAnchor="middle" fontFamily="monospace">
                                                {af.name.toUpperCase().substring(0, 28)}
                                            </text>
                                        </svg>
                                    </div>

                                    <div className="flex justify-between font-mono text-[8px] pt-4" style={{ borderTop: `1px solid ${activeAccent.accentHex}25`, color: `${activeAccent.accentHex}60` }}>
                                        <span>STABILITY STRESS: PASS</span><span>WARP DENSITY: 120/T</span>
                                    </div>
                                </div>

                                {/* Metric bars */}
                                <div className="flex flex-col space-y-6">
                                    <span className="font-sans text-[10px] tracking-widest uppercase mb-2" style={{ color: `${activeAccent.accentHex}90` }}>
                                        BEHAVIORAL COEFFICIENT
                                    </span>
                                    {(['rigidity', 'breathability', 'warmth', 'luster'] as const).map((key) => {
                                        const val = af[key] ?? 0;
                                        return (
                                            <div key={key} className="space-y-2">
                                                <div className="flex justify-between items-center text-[10px] tracking-widest uppercase">
                                                    <span style={{ color: `${PARCH}80` }}>{key}</span>
                                                    <span className="font-mono font-semibold" style={{ color: metricColours[key] || activeAccent.accentHex }}>{val}%</span>
                                                </div>
                                                <div className="w-full h-[3px] rounded-full" style={{ background: 'rgba(240,221,184,0.08)' }}>
                                                    <motion.div
                                                        key={`${af.id}-${key}`}
                                                        initial={{ width: 0 }} animate={{ width: `${val}%` }}
                                                        transition={{ duration: 1.2, ease }}
                                                        className="h-full rounded-full"
                                                        style={{ background: `linear-gradient(90deg, ${metricColours[key] || activeAccent.accentHex}, ${activeAccent.accentHex2})` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {af.formulation && (
                                        <div className="pt-6 mt-4" style={{ borderTop: `1px solid ${activeAccent.accentHex}20` }}>
                                            <span className="font-sans text-[8px] tracking-[0.25em] uppercase block mb-1" style={{ color: activeAccent.accentHex, opacity: 0.55 }}>
                                                Atelier Formulation
                                            </span>
                                            <p className="font-serif italic text-xs leading-relaxed" style={{ color: `${PARCH}55` }}>
                                                "{af.formulation}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};
