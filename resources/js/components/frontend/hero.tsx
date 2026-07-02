import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BG, BRASS, BRASS_L, FOREST, PARCH } from '@/constant/colors';
import { getLocalTimezone, getLocationName, getWeatherString } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { Frontend } from '@/types';

const MARQUEE_WORDS = [
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

export const Hero: React.FC = () => {
  const [weatherString, setWeatherString] = useState<string>("Loading...");
  const [localTime, setLocalTime] = useState<string>('Loading...');
  const [locationName, setLocationName] = useState<string>('Loading...');

  const { frontend } = usePage<PageProps>().props;

  useEffect(() => {
    getLocalTimezone(frontend.information.north_cordinate, frontend.information.east_cordinate)
      .then((timezoneId) => {
        if (!timezoneId) {
          setLocalTime("Time unavailable");
          return;
        }

        // Helper function to calculate and format the current live moment
        const tickClock = () => {
          const now = new Date();
          const formattedTime = now.toLocaleTimeString([], {
            timeZone: timezoneId, // Crucial: Calculates the precise time live in that exact timezone
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          setLocalTime(formattedTime);
        };

        // Run it immediately on layout mount
        tickClock();

        // Keep it updating every second so minutes change perfectly as they happen
        const timerId = setInterval(tickClock, 1000);

        // Cleanup interval if the component unmounts to prevent memory leaks
        return () => clearInterval(timerId);
      })
      .catch(() => {
        setLocalTime("Time unavailable");
      });
  }, [frontend.information.north_cordinate, frontend.information.east_cordinate]);

  useEffect(() => {
    // Call the async function and pass the resolved string directly to state
    getWeatherString(frontend.information.north_cordinate, frontend.information.east_cordinate)
      .then((data) => {
        setWeatherString(data); // This works because 'data' is the actual string
      })
      .catch((err) => {
        setWeatherString("Weather unavailable");
      });
  }, []);

    useEffect(() => {
      getLocationName(frontend.information.north_cordinate, frontend.information.east_cordinate)
      .then((data) => {
          setLocationName(data); // This works because 'data' is the actual string
        })
        .catch((err) => {
          setLocationName("Location unavailable");
        });
    }, []);
  
  const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

  return (
    <section id="hero"
      className="relative min-h-screen flex flex-col justify-between pt-32 pb-12 overflow-hidden editorial-grid"
      style={{ background: `linear-gradient(140deg, ${BG} 0%, #0f2415 45%, #0d1c0e 80%, ${BG} 100%)` }}
    >
      {/* Ambient glows */}
      <div className="absolute top-[10%] left-[5%] w-150 h-150 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(30,77,48,0.22) 0%, transparent 70%)` }} />
      <div className="absolute bottom-[20%] right-[4%] w-125 h-125 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(184,149,42,0.14) 0%, transparent 70%)` }} />
      <div className="absolute top-[55%] left-[45%] w-87.5 h-87.5 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(122,28,28,0.10) 0%, transparent 70%)` }} />

      {/* ── Main Split ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center my-auto z-10">

        {/* Left */}
        <div className="lg:col-span-7 flex flex-col justify-center relative select-none">

          {/* Watermark */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 0.05, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease }}
            className="absolute -top-12 left-0 font-sans text-5xl md:text-8xl font-thin tracking-[0.2em] uppercase pointer-events-none"
            style={{ background: `linear-gradient(90deg, ${BRASS}, ${BRASS_L})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            H A U T E
          </motion.div>

          {/* Headline */}
          <div className="relative z-20 mt-4">
            <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease }}
              className="font-sans text-xs tracking-[0.4em] uppercase block mb-4"
              style={{ color: BRASS, opacity: 0.75 }}
            >
              COLLECTION / 05
            </motion.span>

            <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl font-light leading-[0.95] tracking-tight uppercase">
              <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease }}
                className="block" style={{ color: PARCH }}
              >
                The Silent
              </motion.span>
              <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25, ease }}
                className="block text-right lg:pr-24 italic font-normal"
                style={{ background: `linear-gradient(90deg, ${BRASS}, ${BRASS_L})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Structure
              </motion.span>
            </h1>
          </div>

          {/* Tall narrow image */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 lg:-right-4 w-40 sm:w-56 md:w-64 lg:w-72
                          h-8 sm:h-112.5 lg:h-130 overflow-hidden -z-10 opacity-70 lg:opacity-100 transition-luxury"
            style={{ border: `1px solid rgba(184,149,42,0.28)`, boxShadow: `0 0 48px rgba(30,77,48,0.18), 0 0 80px rgba(184,149,42,0.10)` }}
          >
            <motion.div initial={{ scale: 1.15, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.6, ease }} className="w-full h-full"
            >
              <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80"
                alt="Haute couture tailoring" className="w-full h-full object-cover brightness-90" />
              {/* Forest green + brass wash */}
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(30,77,48,0.15) 0%, rgba(184,149,42,0.22) 100%)' }} />
            </motion.div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-5 flex flex-col items-start lg:pl-16 space-y-10 z-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease }} className="space-y-6"
          >
            <div className="w-12 h-px" style={{ background: `linear-gradient(90deg, ${BRASS}, ${FOREST})` }} />
            <p className="font-serif text-lg md:text-xl leading-relaxed font-light" style={{ color: `${PARCH}E6` }}>
              A study in sartorial architecture. We mold heavy canvas and delicate silk around the human canvas,
              creating garments that are sculptures in slow motion.
            </p>
            <p className="font-sans text-xs tracking-widest leading-loose uppercase" style={{ color: `${PARCH}50` }}>
              No excess. No shortcuts. Just structural integrity born of raw textures and meticulous geometry. Handmade at our Paris atelier.
            </p>
          </motion.div>

          {/* Micro-info */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}
            className="grid grid-cols-2 gap-x-8 gap-y-4 pt-6 w-full max-w-sm"
            style={{ borderTop: `1px solid rgba(184,149,42,0.20)` }}
          >
            {[
              { label: `${frontend.information.name} Location`, value: locationName, col: '#6ba8a4' },
              { label: 'Local Time', value: localTime || '19:27:35', mono: true, col: BRASS_L },
              { label: 'Current Climate', value: weatherString, col: '#4a7c59' },
            ].map(({ label, value, mono, col }) => (
              <div key={label}>
                <span className="block text-[9px] tracking-widest uppercase mb-1" style={{ color: col, opacity: 0.75 }}>{label}</span>
                <span className={`block text-xs mt-1 ${mono ? 'font-mono' : 'font-serif'}`} style={{ color: `${PARCH}CC` }}>{value}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Marquee ── */}
      <div className="w-full overflow-hidden py-4 my-8 z-10 select-none backdrop-blur-sm"
        style={{ borderTop: `1px solid rgba(184,149,42,0.14)`, borderBottom: `1px solid rgba(184,149,42,0.14)`, background: 'rgba(11,26,13,0.62)' }}
      >
        <div className="marquee-content flex items-center space-x-12">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <React.Fragment key={`mq-${i}`}>
              <span className="font-sans text-[10px] tracking-[0.3em] font-medium uppercase" style={{ color: w.color }}>{w.text}</span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: `${BRASS}60` }} />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex justify-between items-center z-10">
        <span className="font-sans text-[9px] tracking-[0.25em] uppercase" style={{ color: `${BRASS}55` }}>
          Sculpture In Motion
        </span>
        <motion.a href="#lookbook"
          onClick={(e) => { e.preventDefault(); document.querySelector('#lookbook')?.scrollIntoView({ behavior: 'smooth' }); }}
          animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="flex items-center space-x-3 text-xs tracking-widest uppercase transition-opacity hover:opacity-80"
          style={{ color: `${BRASS}99` }}
        >
          <span className="font-sans text-[9px] tracking-widest">Scroll Down</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.a>
      </div>
    </section>
  );
};
