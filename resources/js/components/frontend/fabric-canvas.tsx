import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BG, BRASS, BRASS_L, FOREST, OXBLOOD, PARCH, WALNUT } from '@/constant/colors';



interface FabricInfo {
    id: string; name: string; weight: string; thickness: string;
    origin: string; weave: string; description: string;
    accentHex: string; accentHex2: string;
    metrics: { rigidity: number; breathability: number; warmth: number; luster: number };
}

const fabrics: FabricInfo[] = [
    {
        id: 'wool', name: 'Virgin Merino Wool',
        weight: '380 GSM', thickness: 'Heavy Weight', origin: 'Biella, Italy', weave: '2x2 Twill Structure',
        description: 'Sourced from the historic Vitale Barberis Canonico mill in Biella. This wool maintains a crisp structural form that supports rigid shoulder lines and tailored lapels without sagging.',
        accentHex: FOREST, accentHex2: '#2d6a45',
        metrics: { rigidity: 85, breathability: 40, warmth: 75, luster: 15 },
    },
    {
        id: 'organza', name: 'Mulberry Silk Organza',
        weight: '85 GSM', thickness: 'Translucent Sheer', origin: 'Lyon, France', weave: 'High-twist plain filament',
        description: 'A Lyon heirloom textile. High-twist double-ply silk yarn gives an iridescent shimmer under direct lighting. Crisp tensile strength allows dramatic, gravity-defying sleeve clouds.',
        accentHex: OXBLOOD, accentHex2: '#a03030',
        metrics: { rigidity: 65, breathability: 95, warmth: 10, luster: 80 },
    },
    {
        id: 'nylon', name: 'Technical Matte Nylon',
        weight: '190 GSM', thickness: 'Mid Weight', origin: 'Osaka, Japan', weave: 'Ripstop Micro-Grid',
        description: 'Milled in Japan using recycled ocean plastics. The matte finish behaves like traditional cotton paper to the touch, but retains extreme windproof and rainproof integrity.',
        accentHex: WALNUT, accentHex2: '#7a4a22',
        metrics: { rigidity: 45, breathability: 35, warmth: 50, luster: 5 },
    },
    {
        id: 'cashmere', name: 'Brushed Cashmere',
        weight: '450 GSM', thickness: 'Ultra-Heavy Weight', origin: 'Ulaanbaatar, Mongolia', weave: 'Loose carded knit',
        description: 'Spun from the finest undercoat fibres of Mongolian goats. Brushed repeatedly using dried vegetable teasels to tease out the soft pile. Perfect for warm, flowing oversized drapes.',
        accentHex: BRASS, accentHex2: BRASS_L,
        metrics: { rigidity: 20, breathability: 60, warmth: 95, luster: 30 },
    },
    {
        id: 'linen', name: 'Belgian Raw Flax',
        weight: '260 GSM', thickness: 'Breathable Light', origin: 'Flanders, Belgium', weave: 'Slubby plain weave',
        description: 'A Belgian organic flax linen with distinctive slubs and organic colour variations. No starch or chemical softeners — the natural drape softens gradually through body heat over decades.',
        accentHex: '#4a7c59', accentHex2: '#6ba8a4',
        metrics: { rigidity: 70, breathability: 85, warmth: 30, luster: 10 },
    },
];

/* Fixed metric colours — all stay within palette */
const metricColours: Record<string, string> = {
    rigidity: FOREST,
    breathability: '#6ba8a4',
    warmth: OXBLOOD,
    luster: BRASS_L,
};

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export const FabricCanvas: React.FC = () => {
    const [activeId, setActiveId] = useState('wool');
    const af = fabrics.find(f => f.id === activeId) || fabrics[0];

    return (
        <section id="canvas" className="py-32 relative overflow-hidden"
            style={{ borderTop: `1px solid rgba(184,149,42,0.15)`, background: `linear-gradient(180deg, ${BG} 0%, #0d2010 50%, ${BG} 100%)` }}
        >
            {/* Dynamic ambient blob — changes with fabric */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none transition-all duration-1000"
                style={{ background: `radial-gradient(circle, ${af.accentHex}20 0%, transparent 65%)` }} />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none transition-all duration-1000"
                style={{ background: `radial-gradient(circle, ${af.accentHex2}18 0%, transparent 65%)` }} />

            <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">

                {/* Section title */}
                <div className="mb-20 text-center md:text-left">
                    <span className="font-sans text-xs tracking-[0.4em] uppercase block mb-3 font-medium transition-all duration-700"
                        style={{ background: `linear-gradient(90deg, ${af.accentHex}, ${af.accentHex2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                        02 / TACTILE NODE
                    </span>
                    <h2 className="font-serif text-4xl md:text-5xl font-light uppercase tracking-wide" style={{ color: PARCH }}>
                        The Fabric Canvas
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">

                    {/* Left: chips + description */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-12">

                        {/* Fabric chips */}
                        <div className="space-y-4">
                            <span className="font-sans text-[10px] tracking-widest uppercase block mb-6" style={{ color: `${PARCH}40` }}>
                                SELECT TEXTURE TO CANVAS
                            </span>
                            <div className="flex flex-wrap gap-3">
                                {fabrics.map((f) => {
                                    const active = f.id === activeId;
                                    return (
                                        <button key={f.id} onClick={() => setActiveId(f.id)}
                                            className="text-xs uppercase tracking-widest px-5 py-3 cursor-pointer transition-all duration-500"
                                            style={active
                                                ? { background: `linear-gradient(90deg, ${f.accentHex}, ${f.accentHex2})`, color: PARCH, border: `1px solid ${f.accentHex}`, boxShadow: `0 0 18px ${f.accentHex}50` }
                                                : { background: 'transparent', color: `${f.accentHex}CC`, border: `1px solid ${f.accentHex}35` }
                                            }
                                        >
                                            {f.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Animated description + specs */}
                        <div className="relative min-h-[300px] flex flex-col justify-end">
                            <AnimatePresence mode="wait">
                                <motion.div key={af.id}
                                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.5, ease }}
                                    className="space-y-8"
                                >
                                    <div className="w-12 h-[2px] rounded" style={{ background: `linear-gradient(90deg, ${af.accentHex}, ${af.accentHex2})` }} />
                                    <p className="font-serif text-xl md:text-2xl leading-relaxed font-light" style={{ color: `${PARCH}E6` }}>
                                        "{af.description}"
                                    </p>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-6 font-sans text-xs uppercase tracking-wider"
                                        style={{ borderTop: `1px solid ${af.accentHex}25` }}
                                    >
                                        {[
                                            { label: 'Origin Mill', value: af.origin },
                                            { label: 'Density Weight', value: `${af.weight} (${af.thickness})` },
                                            { label: 'Weave / Structure', value: af.weave, full: true },
                                        ].map(({ label, value, full }) => (
                                            <div key={label} className={full ? 'col-span-2' : ''}>
                                                <span className="block text-[8px] tracking-[0.25em] mb-1" style={{ color: af.accentHex, opacity: 0.7 }}>{label.toUpperCase()}</span>
                                                <span className="font-medium" style={{ color: PARCH }}>{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: animated weft schematic + metrics */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center p-8 md:p-12 relative overflow-hidden backdrop-blur-md transition-all duration-700"
                        style={{ background: 'rgba(10,22,12,0.72)', border: `1px solid ${af.accentHex}25` }}
                    >
                        <div className="absolute inset-0 bg-grain pointer-events-none opacity-5" />
                        <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none transition-all duration-700"
                            style={{ background: `radial-gradient(circle, ${af.accentHex}20 0%, transparent 70%)` }} />

                        {/* Warp/Weft Schematic */}
                        <div className="relative aspect-[4/5] w-full overflow-hidden p-6 flex flex-col justify-between shadow-2xl"
                            style={{ border: `1px solid ${af.accentHex}30`, background: 'rgba(7,16,8,0.92)' }}
                        >
                            <div>
                                <span className="block text-[8px] tracking-[0.25em] uppercase mb-1" style={{ color: af.accentHex }}>YARN WEFT SCHEMATIC</span>
                                <span className="block text-[10px] tracking-wider uppercase" style={{ color: `${PARCH}50` }}>
                                    Thread count: 260/inch — Active simulation
                                </span>
                            </div>

                            <div className="w-full h-44 flex items-center justify-center overflow-hidden">
                                <svg className="w-full h-full" viewBox="0 0 200 100" fill="none">
                                    {Array.from({ length: 20 }).map((_, i) => (
                                        <motion.line key={`wp-${i}`}
                                            x1={10 + i * 9} y1={0} x2={10 + i * 9} y2={100}
                                            stroke={af.accentHex}
                                            strokeWidth={activeId === 'wool' || activeId === 'cashmere' ? '0.9' : '0.45'}
                                            animate={{ y1: [0, 4, 0], y2: [100, 96, 100] }}
                                            transition={{ repeat: Infinity, duration: 3, delay: i * 0.1, ease: 'easeInOut' }}
                                        />
                                    ))}
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <motion.line key={`wf-${i}`}
                                            x1={0} y1={10 + i * 7} x2={200} y2={10 + i * 7}
                                            stroke={af.accentHex2}
                                            strokeWidth={activeId === 'wool' || activeId === 'cashmere' ? '0.9' : '0.45'}
                                            animate={{ x1: [0, 6, 0], x2: [200, 194, 200] }}
                                            transition={{ repeat: Infinity, duration: 4, delay: i * 0.12, ease: 'easeInOut' }}
                                        />
                                    ))}
                                    <rect x="45" y="33" width="110" height="34" fill="rgba(7,16,8,0.95)" stroke={af.accentHex} strokeWidth="0.6" />
                                    <text x="100" y="52" fill={af.accentHex} fontSize="6.5" letterSpacing="1.2" textAnchor="middle" fontFamily="monospace">
                                        {af.weave.toUpperCase()}
                                    </text>
                                </svg>
                            </div>

                            <div className="flex justify-between font-mono text-[8px] pt-4" style={{ borderTop: `1px solid ${af.accentHex}25`, color: `${af.accentHex}60` }}>
                                <span>STABILITY STRESS: PASS</span><span>WARP DENSITY: 120/T</span>
                            </div>
                        </div>

                        {/* Metric bars */}
                        <div className="flex flex-col space-y-6">
                            <span className="font-sans text-[10px] tracking-widest uppercase mb-2" style={{ color: `${af.accentHex}90` }}>
                                BEHAVIORAL COEFFICIENT
                            </span>
                            {Object.entries(af.metrics).map(([key, val]) => (
                                <div key={key} className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] tracking-widest uppercase">
                                        <span style={{ color: `${PARCH}80` }}>{key}</span>
                                        <span className="font-mono font-semibold" style={{ color: metricColours[key] || af.accentHex }}>{val}%</span>
                                    </div>
                                    <div className="w-full h-[3px] rounded-full" style={{ background: 'rgba(240,221,184,0.08)' }}>
                                        <motion.div
                                            key={`${af.id}-${key}`}
                                            initial={{ width: 0 }} animate={{ width: `${val}%` }}
                                            transition={{ duration: 1.2, ease }}
                                            className="h-full rounded-full"
                                            style={{ background: `linear-gradient(90deg, ${metricColours[key] || af.accentHex}, ${af.accentHex2})` }}
                                        />
                                    </div>
                                </div>
                            ))}

                            <div className="pt-6 mt-4" style={{ borderTop: `1px solid ${af.accentHex}20` }}>
                                <span className="font-sans text-[8px] tracking-[0.25em] uppercase block mb-1" style={{ color: af.accentHex, opacity: 0.55 }}>
                                    Atelier Formulation
                                </span>
                                <p className="font-serif italic text-xs leading-relaxed" style={{ color: `${PARCH}55` }}>
                                    "Every garment is formulated based on the textile's behavioral coefficient, balancing stiffness with breathing capacity."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
