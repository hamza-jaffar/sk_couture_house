import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BG, BRASS, BRASS_L, FOREST, PARCH } from '@/constant/colors';
import { getLocalTimezone, getLocationName, getWeatherString } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import type { FrontendData, FeaturedCollection } from '@/types/auth';
import type { Frontend } from '@/types';

const DEFAULT_MARQUEE_WORDS = [
  { text: 'SARTORIAL INTEGRITY', color: BRASS_L },
  { text: 'ARCHITECTURAL DRAPE', color: '#6ba8a4' },
  { text: 'SUSTAINABLE ORIGIN', color: '#4a7c59' },
  { text: 'HANDCRAFTED IN PARIS', color: BRASS },
  { text: 'RAW TEXTURAL DUALITY', color: '#9b8fb5' },
  { text: 'MONOLITHIC SILHOUETTE', color: '#c17b7b' },
];

type PageProps = {
  frontend: Frontend;
};

type HeroProps = {
  frontendData: FrontendData | null;
  featuredCollection?: FeaturedCollection | null;
};

export const Hero: React.FC<HeroProps> = ({ frontendData, featuredCollection }) => {
  const [weatherString, setWeatherString] = useState<string>('...');
  const [localTime, setLocalTime] = useState<string>('...');
  const [locationName, setLocationName] = useState<string>('...');

  const { frontend } = usePage<PageProps>().props;

  useEffect(() => {
    getLocalTimezone(frontend.information.north_cordinate, frontend.information.east_cordinate)
      .then((timezoneId) => {
        if (!timezoneId) { setLocalTime('—'); return; }
        const tick = () => {
          setLocalTime(new Date().toLocaleTimeString([], {
            timeZone: timezoneId, hour: '2-digit', minute: '2-digit', hour12: true,
          }));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
      })
      .catch(() => setLocalTime('—'));
  }, [frontend.information.north_cordinate, frontend.information.east_cordinate]);

  useEffect(() => {
    getWeatherString(frontend.information.north_cordinate, frontend.information.east_cordinate)
      .then(setWeatherString).catch(() => setWeatherString('—'));
  }, []);

  useEffect(() => {
    getLocationName(frontend.information.north_cordinate, frontend.information.east_cordinate)
      .then(setLocationName).catch(() => setLocationName('—'));
  }, []);

  const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

  const watermark  = frontendData?.hero_watermark ?? 'HAUTE';
  const heroTitle  = frontendData?.hero_title ?? 'The Silent Structure';
  const heroDesc   = frontendData?.hero_desc ?? 'No excess. No shortcuts. Just structural integrity born of raw textures and meticulous geometry. Handmade at our Paris atelier.';
  const scrollText = frontendData?.scroll_indicator_text ?? 'Scroll Down';
  const heroImageSrc = frontendData?.hero_image
    ? `/storage/${frontendData.hero_image}`
    : 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80';

  const rawMarquee = frontendData?.marquee;
  const marqueeWords: { text: string; color: string }[] =
    Array.isArray(rawMarquee) && rawMarquee.length > 0 ? rawMarquee : DEFAULT_MARQUEE_WORDS;
  const marqueeDouble = [...marqueeWords, ...marqueeWords];

  const microInfo = [
    { label: `${frontend.information.name} Location`, value: locationName, col: '#6ba8a4' },
    { label: 'Local Time', value: localTime, mono: true, col: BRASS_L },
    { label: 'Weather', value: weatherString, col: '#4a7c59' },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col overflow-hidden editorial-grid"
      style={{ background: `linear-gradient(140deg, ${BG} 0%, #0f2415 45%, #0d1c0e 80%, ${BG} 100%)` }}
    >
      {/* ── Ambient glows ── */}
      <div className="absolute top-[5%]  left-[2%]  w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(30,77,48,0.25) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[15%] right-[2%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,149,42,0.16) 0%, transparent 70%)' }} />

      {/* ══════════════════════════════════════════
          MAIN CONTENT — flex grows to fill screen
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex items-center pt-28 pb-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">

          {/*
            Two-column from md (768 px) upward:
              • Left  — 7 / 12  cols: headline + desc + micro-stats
              • Right — 5 / 12  cols: tall portrait image
          */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 items-center">

            {/* ── LEFT COLUMN ── */}
            <div className="md:col-span-7 flex flex-col gap-6 relative select-none">

              {/* Decorative watermark (very faint, clipped) */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 0.04 }}
                transition={{ duration: 1.2, ease }}
                className="absolute -top-8 -left-4 text-[80px] md:text-[120px] font-sans font-thin
                           tracking-[0.25em] uppercase pointer-events-none whitespace-nowrap leading-none"
                style={{
                  background: `linear-gradient(90deg, ${BRASS}, ${BRASS_L})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {watermark}
              </motion.div>

              {/* Collection label */}
              <motion.span
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease }}
                className="font-sans text-[10px] tracking-[0.45em] uppercase"
                style={{ color: BRASS, opacity: 0.7 }}
              >
                COLLECTION / {featuredCollection?.id ? featuredCollection.id.toString().padStart(2, '0') : '05'}
              </motion.span>

              {/* ── Headline ── */}
              <div className="relative z-10">
                <h1
                  className="font-serif font-light leading-[1.05] tracking-tight uppercase"
                  style={{
                    fontSize: 'clamp(1.6rem, 3.8vw, 4rem)',
                    color: PARCH,
                  }}
                >
                  <motion.span
                    initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease }}
                    className="block"
                  >
                    {heroTitle}
                  </motion.span>
                </h1>
              </div>

              {/* Divider + Description */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease }}
                className="flex flex-col gap-4 max-w-xl"
              >
                <div className="w-10 h-px" style={{ background: `linear-gradient(90deg, ${BRASS}, ${FOREST})` }} />
                <p
                  className="font-serif font-light leading-relaxed"
                  style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.125rem)', color: `${PARCH}DD` }}
                >
                  {heroDesc}
                </p>
              </motion.div>

              {/* Micro-info stats */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.5 }}
                className="grid grid-cols-3 gap-4 pt-5"
                style={{ borderTop: `1px solid rgba(184,149,42,0.18)` }}
              >
                {microInfo.map(({ label, value, mono, col }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span
                      className="text-[9px] font-sans tracking-widest uppercase"
                      style={{ color: col, opacity: 0.7 }}
                    >
                      {label}
                    </span>
                    <span
                      className={`text-xs ${mono ? 'font-mono' : 'font-serif'}`}
                      style={{ color: `${PARCH}BB` }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── RIGHT COLUMN — portrait image ── */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <motion.div
                initial={{ scale: 1.08, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.6, ease }}
                className="relative overflow-hidden"
                style={{
                  width: 'min(340px, 100%)',
                  height: 'clamp(320px, 55vh, 580px)',
                  border: `1px solid rgba(184,149,42,0.30)`,
                  boxShadow: '0 0 60px rgba(30,77,48,0.20), 0 0 100px rgba(184,149,42,0.10)',
                }}
              >
                <img
                  src={heroImageSrc}
                  alt="Haute couture"
                  className="w-full h-full object-cover"
                  style={{ filter: 'brightness(0.88) saturate(0.95)' }}
                />
                {/* Colour wash overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(160deg, rgba(30,77,48,0.18) 0%, rgba(184,149,42,0.20) 100%)' }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 px-4 py-3"
                  style={{ background: 'linear-gradient(0deg, rgba(11,26,13,0.85) 0%, transparent 100%)' }}
                >
                  <span
                    className="font-sans text-[8px] tracking-[0.4em] uppercase"
                    style={{ color: `${BRASS_L}99` }}
                  >
                    {frontend.information.name || 'Atelier'} — {frontendData?.lookbook_tag || 'SS 2026'}
                  </span>
                </div>
              </motion.div>
            </div>

          </div>{/* /grid */}
        </div>
      </div>

      {/* ── Marquee ticker ── */}
      <div
        className="w-full overflow-hidden py-3 select-none"
        style={{
          borderTop:    `1px solid rgba(184,149,42,0.14)`,
          borderBottom: `1px solid rgba(184,149,42,0.14)`,
          background:   'rgba(11,26,13,0.55)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/*
          Animation is fully inline — no CSS class dependency.
          translateX(-50%) scrolls through the doubled list for a seamless loop.
        */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3rem',
            width: 'max-content',
            animation: 'marquee 30s linear infinite',
            willChange: 'transform',
          }}
        >
          {marqueeDouble.map((w, i) => (
            <React.Fragment key={`mq-${i}`}>
              <span
                style={{
                  color: w.color,
                  fontFamily: 'inherit',
                  fontSize: '10px',
                  letterSpacing: '0.32em',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {w.text}
              </span>
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: `${BRASS}55`,
                  flexShrink: 0,
                  display: 'inline-block',
                }}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full flex justify-between items-center py-5">
        <span
          className="font-sans text-[9px] tracking-[0.28em] uppercase hidden sm:block"
          style={{ color: `${BRASS}44` }}
        >
          Sculpture In Motion
        </span>
        <motion.a
          href="#lookbook"
          onClick={(e) => {
            e.preventDefault();
            document.querySelector('#lookbook')?.scrollIntoView({ behavior: 'smooth' });
          }}
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity ml-auto"
          style={{ color: `${BRASS}88` }}
        >
          <span className="font-sans text-[9px] tracking-widest uppercase">{scrollText}</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.a>
      </div>
    </section>
  );
};
