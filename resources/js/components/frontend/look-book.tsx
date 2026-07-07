import React from 'react';
import { motion } from 'framer-motion';
import { BG, BRASS, BRASS_L, FOREST, OXBLOOD, PARCH, WALNUT } from '@/constant/colors';
import type { FrontendData, CollectionItemType, Frontend } from '@/types/auth';
import { usePage, Link } from '@inertiajs/react';
import { Category } from '@/types/data';
import { toSafeURL } from '@/lib/utils';

// Accent colour cycle for items
const ACCENT_CYCLES = [
  { accentHex: FOREST, accentHex2: '#2d6a45', sketchStroke: '#4a9c6a' },
  { accentHex: OXBLOOD, accentHex2: '#a03030', sketchStroke: '#c06060' },
  { accentHex: WALNUT, accentHex2: '#7a4a22', sketchStroke: '#c08050' },
  { accentHex: BRASS, accentHex2: BRASS_L, sketchStroke: BRASS_L },
];

// Placeholder images to cycle through when no image is stored
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
];

type LookbookProps = {
  categories: Category[];
  frontendData: FrontendData | null;
};

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

type PageProps = {
  frontend: Frontend;
};

export const Lookbook: React.FC<LookbookProps> = ({ categories, frontendData }) => {
  const lookbookTag = frontendData?.lookbook_tag ?? '01 / RUNWAY TRACK';
  
  // Clean filtering: Only include categories that actually contain collections with items
  const categorySections = categories.filter((category) => 
    category.collections?.some((collection) => collection.items?.length > 0)
  );

  // Fallbacks for header titles if data isn't loaded dynamically inside loop items yet
  const fallbackTitle = 'Curated Collections';
  const fallbackDesc = 'An asymmetric exploration of structural draping, textiles in their raw form, and the geometry of architectural couture.';

  const headingTitle = categorySections.length > 0
    ? categorySections.map((category) => category.name).join(' / ')
    : fallbackTitle;

  const { frontend } = usePage<PageProps>().props;

  // Track if overall system has items across all possible maps
  const hasAnyItems = categorySections.length > 0;

  return (
    <section id="lookbook" className="py-32 px-6 md:px-12 max-w-7xl mx-auto"
      style={{ borderTop: `1px solid rgba(184,149,42,0.18)` }}
    >
      {/* Main Structural Map Loop */}
      {hasAnyItems ? (
        <div className="space-y-32">
          {categorySections.map((category) => (
            <div key={category.id} className="space-y-16" id={toSafeURL(category.name)} >
              {/* Category Anchor Label */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-white/5 pb-6">
                <div>
                  <p className="font-sans text-[10px] tracking-[0.35em] uppercase mb-1" style={{ color: `${BRASS}` }}>
                    CATEGORY WORKWAY
                  </p>
                  <h3 className="font-serif text-3xl md:text-4xl font-light uppercase tracking-wide" style={{ color: PARCH }}>
                    {category.name}
                  </h3>
                </div>
                {category.desc && (
                  <p className="font-sans text-xs tracking-widest max-w-md leading-relaxed uppercase" style={{ color: `${PARCH}55` }}>
                    {category.desc}
                  </p>
                )}
              </div>

              {/* Collections Container inside current Category */}
              {category.collections?.filter(col => col.items?.length > 0).map((collection) => (
                <div key={collection.id} className="space-y-12">
                  <div className="border-l-2 pl-4" style={{ borderColor: `${BRASS}33` }}>
                    <h4 className="font-serif text-xl md:text-2xl uppercase tracking-widest font-light" style={{ color: `${PARCH}90` }}>
                      {collection.title}
                    </h4>
                  </div>

                  {/* Structural Asymmetric Grid layout containing all items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24 md:gap-y-36">
                    {collection.items.map((item, idx) => {
                      const isEven = idx % 2 === 1;
                      const accent = ACCENT_CYCLES[idx % ACCENT_CYCLES.length];
                      const image = item.image
                        ? `/storage/${item.image}`
                        : PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length];
                      
                      const pieceName = item.piece_title || item.peice_title || 'Untitled Piece';
                      const subtitle = `${category.name.toUpperCase()} / ${collection.title.toUpperCase()} / PIECE ${String(idx + 1).padStart(2, '0')}`;

                      return (
                        <motion.div key={item.id}
                          initial={{ opacity: 0, y: 80 }} 
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-100px' }}
                          transition={{ duration: 0.8, ease }}
                          className={`flex flex-col ${isEven ? 'md:mt-24' : ''} group`}
                        >
                          <Link href={`/collection-items/${item.id}`} className="block w-full">
                            <div className="relative aspect-[3/4] w-full overflow-hidden mb-8 cursor-pointer"
                              style={{ border: `1px solid rgba(184,149,42,0.18)`, background: BG }}
                            >
                              <div className="absolute top-0 left-0 right-0 h-[3px] z-30"
                                style={{ background: `linear-gradient(90deg, ${accent.accentHex}, ${accent.accentHex2})` }} />

                              <motion.div className="w-full h-full"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.8, ease }}
                              >
                                <img src={image} alt={pieceName}
                                  className="w-full h-full object-cover brightness-85 group-hover:brightness-95 transition-all duration-700" />
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-opacity duration-700"
                                  style={{ background: `linear-gradient(180deg, ${accent.accentHex} 0%, transparent 60%)` }} />
                              </motion.div>

                              {/* Hover Backdrop Details Panel */}
                              <div className="absolute inset-x-0 bottom-0 backdrop-blur-md p-6 md:p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-700 z-20"
                                style={{ background: 'rgba(9,20,10,0.95)', borderTop: `1px solid ${accent.accentHex}55` }}
                              >
                                <div className="flex justify-between items-baseline mb-4">
                                  <span className="font-sans text-[10px] tracking-widest uppercase" style={{ color: `${PARCH}55` }}>FABRIC MATRIX</span>
                                  {item.gsm && (
                                    <span className="font-mono text-[10px] tracking-wider uppercase font-semibold" style={{ color: accent.sketchStroke }}>{item.gsm}</span>
                                  )}
                                </div>
                                <h4 className="font-serif text-2xl font-light mb-2 uppercase" style={{ color: PARCH }}>{pieceName}</h4>
                                {item.desc && (
                                  <p className="font-sans text-xs tracking-wide leading-relaxed mb-4" style={{ color: `${PARCH}80` }}>{item.desc}</p>
                                )}
                                {item.note && (
                                  <div className="pt-4" style={{ borderTop: `1px solid ${accent.accentHex}33` }}>
                                    <span className="block text-[8px] tracking-[0.2em] uppercase mb-1" style={{ color: accent.sketchStroke, opacity: 0.7 }}>
                                      {frontend?.information?.name || 'STUDIO'} DESIGN NOTE
                                    </span>
                                    <p className="font-sans text-[11px] italic" style={{ color: `${PARCH}55` }}>&quot;{item.note}&quot;</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Info Block underneath card */}
                            <div className="flex justify-between items-start cursor-pointer">
                              <div>
                                <span className="font-sans text-[9px] tracking-[0.3em] uppercase block mb-1" style={{ color: accent.sketchStroke, opacity: 0.7 }}>
                                  {subtitle}
                                </span>
                                <h3 className="font-serif text-3xl font-light tracking-wide uppercase transition-all duration-500"
                                  style={{ background: `linear-gradient(90deg, ${accent.sketchStroke}, ${PARCH})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                                >
                                  {pieceName}
                                </h3>
                              </div>
                              <div className="w-8 h-8 rounded-full flex items-center justify-center mt-2 opacity-40 group-hover:opacity-100 transition-all duration-500"
                                style={{ border: `1px solid ${accent.accentHex}`, boxShadow: `0 0 12px ${accent.accentHex}40` }}
                              >
                                <svg className="w-3.5 h-3.5 -rotate-45 group-hover:rotate-0 transition-transform duration-500"
                                  fill="none" stroke={accent.sketchStroke} viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        /* Empty Fallback State */
        <div className="flex flex-col items-center justify-center py-24 space-y-4"
          style={{ border: `1px solid rgba(184,149,42,0.12)` }}
        >
          <div className="w-12 h-px" style={{ background: `linear-gradient(90deg, ${BRASS}, ${BRASS_L})` }} />
          <p className="font-serif text-2xl font-light uppercase tracking-widest" style={{ color: `${PARCH}40` }}>
            Collection Coming Soon
          </p>
          <p className="font-sans text-xs tracking-widest uppercase" style={{ color: `${PARCH}25` }}>
            Pieces will appear here once added via the dashboard
          </p>
        </div>
      )}
    </section>
  );
};