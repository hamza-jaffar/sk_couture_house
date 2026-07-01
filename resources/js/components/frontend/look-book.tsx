import React from 'react';
import { motion } from 'framer-motion';
import { BG, BRASS, BRASS_L, FOREST, OXBLOOD, PARCH, WALNUT } from '@/constant/colors';

interface CollectionItem {
  id: number; title: string; subtitle: string; image: string;
  fabric: string; gsm: string; notes: string; silhouette: string;
  sketchPaths: string[]; viewBox: string;
  accentHex: string; accentHex2: string; sketchStroke: string;
}

const collections: CollectionItem[] = [
  {
    id: 1,
    title: 'Sartorial Structure', subtitle: 'COLLECTION 05 / PIECE I',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
    fabric: '100% Virgin Merino Wool', gsm: '380 GSM',
    silhouette: 'Sharply structured shoulder pads, hand-padded lapels, sculpted double-darted waist seam.',
    notes: 'Utilizes historical Parisian canvas padding inside the chest area for rigid structure.',
    viewBox: '0 0 100 100',
    sketchPaths: [
      'M 15 10 L 85 10 L 85 45 L 65 45 L 50 75 L 35 45 L 15 45 Z',
      'M 35 10 L 35 45 M 65 10 L 65 45', 'M 50 10 L 50 75',
      'M 15 25 L 35 25 M 85 25 L 65 25',
    ],
    /* Forest Green card */
    accentHex: FOREST, accentHex2: '#2d6a45', sketchStroke: '#4a9c6a',
  },
  {
    id: 2,
    title: 'Raw Organza', subtitle: 'COLLECTION 05 / PIECE II',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
    fabric: '70% Silk, 30% Glass Organza', gsm: '85 GSM',
    silhouette: 'Oversized cocoon sleeve, raw-edged sheer hemline, dual-layered transparency.',
    notes: 'French-seamed interior edges to maintain absolute transparency under light.',
    viewBox: '0 0 100 100',
    sketchPaths: [
      'M 30 10 C 40 12, 60 12, 70 10 C 75 35, 75 65, 80 90 C 60 85, 40 85, 20 90 C 25 65, 25 35, 30 10 Z',
      'M 30 35 C 45 40, 55 40, 70 35', 'M 25 50 C 35 55, 65 55, 75 50',
    ],
    /* Oxblood Red card */
    accentHex: OXBLOOD, accentHex2: '#a03030', sketchStroke: '#c06060',
  },
  {
    id: 3,
    title: 'Monochrome Technical', subtitle: 'COLLECTION 05 / PIECE III',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1000&q=80',
    fabric: '100% Matte Recycled Nylon', gsm: '190 GSM',
    silhouette: 'Oversized utility hood, elasticated cinch hem, matte metal hardware details.',
    notes: 'Treated with water-repellent biological wax layer for technical performance.',
    viewBox: '0 0 100 100',
    sketchPaths: [
      'M 20 20 L 40 10 L 60 10 L 80 20 L 75 80 L 25 80 Z', 'M 50 10 L 50 80',
      'M 30 35 H 45 V 50 H 30 Z M 70 35 H 55 V 50 H 70 Z', 'M 25 80 C 35 83, 65 83, 75 80',
    ],
    /* Walnut Brown card */
    accentHex: WALNUT, accentHex2: '#7a4a22', sketchStroke: '#c08050',
  },
  {
    id: 4,
    title: 'Sculpted Cashmere', subtitle: 'COLLECTION 05 / PIECE IV',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
    fabric: '100% Mongolian Cashmere', gsm: '450 GSM',
    silhouette: 'Soft dropped shoulders, heavy rib-knit mock neck collar, elongated side-slits.',
    notes: 'Knitted using standard 12-gauge tensioning for heavy weight and dense texture.',
    viewBox: '0 0 100 100',
    sketchPaths: [
      'M 15 15 L 30 10 L 70 10 L 85 15 L 80 85 L 20 85 Z',
      'M 30 10 L 30 25 C 40 28, 60 28, 70 25 L 70 10',
      'M 15 15 L 25 45 M 85 15 L 75 45', 'M 20 75 H 80',
    ],
    /* Antique Brass card */
    accentHex: BRASS, accentHex2: BRASS_L, sketchStroke: BRASS_L,
  },
];

const ease = [0.16, 1, 0.3, 1] as [number,number,number,number];

export const Lookbook: React.FC = () => {
  const lineAnim = {
    hidden:  { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 0.65, transition: { duration: 2, ease } },
  };

  return (
    <section id="lookbook" className="py-32 px-6 md:px-12 max-w-7xl mx-auto"
      style={{ borderTop: `1px solid rgba(184,149,42,0.18)` }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 space-y-6 md:space-y-0">
        <div>
          <span className="font-sans text-xs tracking-[0.4em] uppercase block mb-3 font-medium"
            style={{ background: `linear-gradient(90deg, ${BRASS}, ${BRASS_L})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            01 / RUNWAY TRACK
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-light uppercase tracking-wide" style={{ color: PARCH }}>
            Curated Collections
          </h2>
        </div>
        <p className="font-sans text-xs tracking-widest max-w-sm leading-relaxed uppercase" style={{ color: `${PARCH}55` }}>
          An asymmetric exploration of structural draping, textiles in their raw form, and the geometry of architectural couture.
        </p>
      </div>

      {/* Asymmetric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24 md:gap-y-36">
        {collections.map((item, idx) => {
          const isEven = idx % 2 === 1;
          return (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease }}
              className={`flex flex-col ${isEven ? 'md:mt-24' : ''} group`}
            >
              {/* Image Card */}
              <div className="relative aspect-[3/4] w-full overflow-hidden mb-8"
                style={{ border: `1px solid rgba(184,149,42,0.18)`, background: BG }}
              >
                {/* Per-card accent top bar — Forest, Oxblood, Walnut, Brass */}
                <div className="absolute top-0 left-0 right-0 h-[3px] z-30"
                  style={{ background: `linear-gradient(90deg, ${item.accentHex}, ${item.accentHex2})` }} />

                {/* Image with subtle accent wash */}
                <motion.div className="w-full h-full"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8, ease }}
                >
                  <img src={item.image} alt={item.title}
                    className="w-full h-full object-cover brightness-85 group-hover:brightness-95 transition-all duration-700" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-opacity duration-700"
                    style={{ background: `linear-gradient(180deg, ${item.accentHex} 0%, transparent 60%)` }} />
                </motion.div>

                {/* Sketch overlay */}
                <div className="absolute top-4 right-4 w-28 h-28 backdrop-blur-sm p-3 pointer-events-none hidden sm:block"
                  style={{ background: 'rgba(11,26,13,0.88)', border: `1px solid rgba(184,149,42,0.22)` }}
                >
                  <span className="block text-[7px] tracking-widest uppercase mb-1" style={{ color: item.sketchStroke, opacity: 0.8 }}>
                    PATTERN SCHEMATIC
                  </span>
                  <svg viewBox={item.viewBox} className="w-full h-20" fill="none" stroke={item.sketchStroke} strokeWidth="0.8">
                    {item.sketchPaths.map((d, i) => (
                      <motion.path key={i} d={d} variants={lineAnim} initial="hidden" whileInView="visible" viewport={{ once: true }} />
                    ))}
                  </svg>
                </div>

                {/* Hover Details Panel */}
                <div className="absolute inset-x-0 bottom-0 backdrop-blur-md p-6 md:p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-700 z-20"
                  style={{ background: 'rgba(9,20,10,0.95)', borderTop: `1px solid ${item.accentHex}55` }}
                >
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="font-sans text-[10px] tracking-widest uppercase" style={{ color: `${PARCH}55` }}>FABRIC MATRIX</span>
                    <span className="font-mono text-[10px] tracking-wider uppercase font-semibold" style={{ color: item.sketchStroke }}>{item.gsm}</span>
                  </div>
                  <h4 className="font-serif text-2xl font-light mb-2 uppercase" style={{ color: PARCH }}>{item.fabric}</h4>
                  <p className="font-sans text-xs tracking-wide leading-relaxed mb-4" style={{ color: `${PARCH}80` }}>{item.silhouette}</p>
                  <div className="pt-4" style={{ borderTop: `1px solid ${item.accentHex}33` }}>
                    <span className="block text-[8px] tracking-[0.2em] uppercase mb-1" style={{ color: item.sketchStroke, opacity: 0.7 }}>
                      ATELIER DESIGN NOTE
                    </span>
                    <p className="font-sans text-[11px] italic" style={{ color: `${PARCH}55` }}>"{item.notes}"</p>
                  </div>
                </div>
              </div>

              {/* Title row */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-sans text-[9px] tracking-[0.3em] uppercase block mb-1" style={{ color: item.sketchStroke, opacity: 0.7 }}>
                    {item.subtitle}
                  </span>
                  <h3 className="font-serif text-3xl font-light tracking-wide uppercase transition-all duration-500"
                    style={{ background: `linear-gradient(90deg, ${item.sketchStroke}, ${PARCH})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    {item.title}
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mt-2 opacity-40 group-hover:opacity-100 transition-all duration-500"
                  style={{ border: `1px solid ${item.accentHex}`, boxShadow: `0 0 12px ${item.accentHex}40` }}
                >
                  <svg className="w-3.5 h-3.5 -rotate-45 group-hover:rotate-0 transition-transform duration-500"
                    fill="none" stroke={item.sketchStroke} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
