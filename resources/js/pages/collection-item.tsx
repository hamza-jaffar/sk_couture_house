import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/frontend/navigation';
import { Footer } from '@/components/frontend/footer';
import { BG, BRASS, BRASS_L, FOREST, OXBLOOD, PARCH, WALNUT } from '@/constant/colors';
import { Frontend, FabricCanvasItem } from '@/types/auth';

type CollectionItemType = {
    id: number;
    peice_title: string;
    desc: string | null;
    note: string | null;
    gsm: string | null;
    image: string | null;
    collection: {
        title: string;
    };
};

type PageProps = {
    frontendData: any;
    frontend: Frontend;
    fabricCanvases: FabricCanvasItem[];
    item: CollectionItemType;
};

export default function CollectionItemDetail({ frontend, item, fabricCanvases }: PageProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToFooter = () => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden selection:bg-amber-900/30" style={{ background: '#0b1a0d', color: '#f0ddb8' }}>
            <Head title={`${item.peice_title} | ${frontend.information.name}`} />

            {/* Ambient Backgrounds */}
            <div className="fixed top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full pointer-events-none z-0"
                style={{ background: `radial-gradient(circle, ${FOREST}40 0%, transparent 70%)` }} />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full pointer-events-none z-0"
                style={{ background: `radial-gradient(circle, ${OXBLOOD}30 0%, transparent 70%)` }} />
            <div className="bg-grain fixed inset-0 z-0 opacity-40 pointer-events-none" />

            <Navigation activeSection="" />

            <main className="relative z-10 min-h-screen flex flex-col md:flex-row pt-20">
                {/* Left Side: Large Imagery */}
                <div className="w-full md:w-1/2 min-h-[50vh] md:min-h-screen relative flex items-center justify-center p-8 md:p-16">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-xl aspect-[3/4] relative overflow-hidden"
                        style={{ border: `1px solid ${BRASS}30` }}
                    >
                        {item.image ? (
                            <img 
                                src={`/storage/${item.image}`} 
                                alt={item.peice_title} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black/20" style={{ color: `${PARCH}50` }}>
                                <span className="font-serif tracking-widest uppercase text-sm">Image Unavailable</span>
                            </div>
                        )}
                        <div className="absolute inset-0 border border-white/5 pointer-events-none" />
                    </motion.div>
                </div>

                {/* Right Side: Detail Typography */}
                <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12 md:py-0">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-md space-y-10"
                    >
                        <div className="space-y-4">
                            <span className="font-sans text-[10px] tracking-[0.3em] uppercase block"
                                style={{ background: `linear-gradient(90deg, ${BRASS}, ${BRASS_L})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                            >
                                {item.collection.title}
                            </span>
                            <h1 className="font-serif text-5xl md:text-6xl font-light uppercase leading-[1.05] tracking-tight" style={{ color: PARCH }}>
                                {item.peice_title}
                            </h1>
                            <div className="w-12 h-0.5" style={{ background: `linear-gradient(90deg, ${FOREST}, ${OXBLOOD})` }} />
                        </div>

                        {item.desc && (
                            <p className="font-serif text-lg leading-relaxed font-light" style={{ color: `${PARCH}90` }}>
                                {item.desc}
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-8 py-8 border-y" style={{ borderColor: `${BRASS}20` }}>
                            {item.gsm && (
                                <div className="space-y-2">
                                    <span className="font-sans text-[9px] uppercase tracking-widest" style={{ color: `${PARCH}60` }}>Weight & Density</span>
                                    <p className="font-serif tracking-wide text-lg" style={{ color: BRASS_L }}>{item.gsm}</p>
                                </div>
                            )}
                            {item.note && (
                                <div className="space-y-2">
                                    <span className="font-sans text-[9px] uppercase tracking-widest" style={{ color: `${PARCH}60` }}>Atelier Note</span>
                                    <p className="font-serif tracking-wide text-lg" style={{ color: BRASS_L }}>{item.note}</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={scrollToFooter}
                                className="w-full md:w-auto px-12 py-4 font-sans text-xs uppercase tracking-[0.25em] font-medium transition-all duration-500 hover:scale-[1.02]"
                                style={{ 
                                    background: `linear-gradient(90deg, ${FOREST}, ${OXBLOOD}, ${WALNUT})`, 
                                    color: PARCH, 
                                    boxShadow: `0 0 28px rgba(30,77,48,0.30)` 
                                }}
                            >
                                Request Consultation
                            </button>
                            <div className="mt-6 flex gap-4">
                                <Link 
                                    href="/" 
                                    className="font-sans text-[10px] uppercase tracking-widest transition-opacity hover:opacity-100"
                                    style={{ color: `${BRASS}80` }}
                                >
                                    ← Back to Collections
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
