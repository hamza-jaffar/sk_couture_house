import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRASS, BRASS_L, OXBLOOD, PARCH, WALNUT } from '@/constant/colors';
import { Frontend } from '@/types';
import { usePage } from '@inertiajs/react';
import { getLocationName, toSafeURL } from '@/lib/utils';
import AppLogoIcon from '../app-logo-icon';
import { Category } from '@/types/data';

interface NavigationProps {
  activeSection: string;
  categories: Category[];
}

type PageProps = {
  frontend: Frontend;
};

export const Navigation: React.FC<NavigationProps> = ({ activeSection, categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [locationName, setLocationName] = useState<string>('Loading...');

  const { frontend } = usePage<PageProps>().props;

  const category = categories.map(cat => ({
    name: cat.name,
    href: `/#categories-${cat.name}`, // Or whatever your URL structure is
    id: cat.id || cat.name.toLowerCase()
  }));

  const items = [
    { name: 'Philosophy', href: '/#hero', id: 'hero' },
    ...category.map(cat => {
      return {
        name: cat.name,
        href: `/#${toSafeURL(cat.name)}`,
        id: `${toSafeURL(cat.name)}`
      };
    }),
    { name: 'Fabric Canvas', href: '/#canvas', id: 'canvas' },
    { name: 'Book Appointment', href: '/#contact', id: 'contact' },
  ];



  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault(); setIsOpen(false);
    if (window.location.pathname === '/') {
      const hash = href.replace('/', '');
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = href;
    }
  };

  useEffect(() => {
    getLocationName(frontend.information.north_cordinate, frontend.information.east_cordinate)
      .then((data) => {
        setLocationName(data); // This works because 'data' is the actual string
      })
      .catch((err) => {
        setLocationName("Location unavailable");
      });
  }, []);

  const menuVar = {
    initial: { x: '100%' },
    animate: { x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
    exit: { x: '100%', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.1 } },
  };
  const listVar = {
    animate: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
    exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
  };
  const itemVar = {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
    exit: { y: 30, opacity: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };

  return (
    <>
      {/* ── Fixed Header ── */}
      <header
        className="fixed top-0 left-0 w-full z-40 backdrop-blur-md transition-luxury"
        style={{ background: 'rgba(11,26,13,0.88)', borderBottom: `1px solid rgba(184,149,42,0.18)` }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">

          {/* Logo — antique brass */}
          <a href="/#hero" className='flex gap-2' onClick={(e) => go(e, '#hero')}>
            <AppLogoIcon className="size-10 fill-current text-white" />
          </a>


          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-12 relative">
            {items.map((item) => (
              <a key={item.name} href={item.href} onClick={(e) => go(e, item.href)}
                className="text-xs uppercase tracking-[0.2em] font-light relative py-2 transition-colors duration-300"
                style={{ color: activeSection === item.id ? BRASS_L : `${PARCH}70` }}
              >
                {item.name}
                {activeSection === item.id && (
                  <motion.span layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 w-full h-[1px]"
                    style={{ background: `linear-gradient(90deg, ${BRASS}, ${BRASS_L})` }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </nav>

          {/* Hamburger — brass lines */}
          <button onClick={() => setIsOpen(!isOpen)}
            className="flex md:hidden flex-col space-y-1.5 items-end justify-center w-8 h-8 group relative z-50 focus:outline-none"
            aria-label="Toggle Menu"
          >
            <span className={`h-[1px] transition-all duration-500 ${isOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`} style={{ background: BRASS }} />
            <span className={`h-[1px] transition-all duration-500 ${isOpen ? 'w-0 opacity-0' : 'w-4 group-hover:w-6'}`} style={{ background: BRASS_L }} />
            <span className={`h-[1px] transition-all duration-500 ${isOpen ? 'w-6 -rotate-45 -translate-y-1.5' : 'w-5'}`} style={{ background: BRASS }} />
          </button>
        </div>
      </header>

      {/* ── Slide-out Menu ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 backdrop-blur-sm z-40"
              style={{ background: 'rgba(7,14,8,0.70)' }}
              transition={{ duration: 0.5 }}
            />

            <motion.div variants={menuVar} initial="initial" animate="animate" exit="exit"
              className="fixed top-0 right-0 w-full sm:w-[480px] h-full z-45 p-12 md:p-20 flex flex-col justify-between"
              style={{ background: '#0d1f0f', borderLeft: `1px solid rgba(184,149,42,0.2)` }}
            >
              {/* Brass / oxblood / walnut top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${BRASS}, ${OXBLOOD}, ${WALNUT}, ${BRASS_L})` }} />

              {/* Close button */}
              <button onClick={() => setIsOpen(false)}
                className="absolute top-8 right-8 focus:outline-none z-50 cursor-pointer p-2 transition-transform duration-300 hover:rotate-90"
                style={{ color: BRASS }} aria-label="Close Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="absolute inset-0 bg-grain pointer-events-none opacity-5" />

              {/* Coordinates */}
              <div className="pt-8 pb-8" style={{ borderBottom: `1px solid rgba(184,149,42,0.15)` }}>
                <span className="font-sans text-[10px] tracking-[0.25em] uppercase block mb-1" style={{ color: BRASS, opacity: 0.7 }}>
                  Atelier Coordinates
                </span>
                <span className="font-serif italic text-sm" style={{ color: `${PARCH}CC` }}>
                  {frontend.information.north_cordinate}° N, {frontend.information.east_cordinate}° {locationName}
                </span>
              </div>

              {/* Nav links */}
              <motion.nav variants={listVar} className="flex flex-col space-y-8 my-auto">
                {items.map((item, idx) => (
                  <motion.div key={item.name} variants={itemVar} className="overflow-hidden">
                    <a href={item.href} onClick={(e) => go(e, item.href)}
                      className="group flex items-baseline space-x-6 transition-opacity hover:opacity-80"
                    >
                      <span className="font-sans text-xs tracking-widest" style={{ color: `${BRASS}55` }}>0{idx + 1}.</span>
                      <span className="font-serif text-xl md:text-2xl font-light tracking-wide uppercase relative" style={{ color: PARCH }}>
                        {item.name}
                        <span className="absolute left-0 bottom-0 w-0 h-[1px] group-hover:w-full transition-all duration-500"
                          style={{ background: `linear-gradient(90deg, ${BRASS}, ${BRASS_L})` }} />
                      </span>
                    </a>
                  </motion.div>
                ))}
              </motion.nav>

              {/* Bottom row */}
              <div className="pt-8 flex justify-between items-end" style={{ borderTop: `1px solid rgba(184,149,42,0.12)` }}>
                <div>
                  <span className="font-sans text-[10px] tracking-widest uppercase block mb-2" style={{ color: `${BRASS}88` }}>Inquiries</span>
                  <a href={`mailto:${frontend.information.email}`} className="text-xs tracking-wider transition-opacity hover:opacity-80" style={{ color: `${PARCH}99` }}>
                    {frontend.information.email}
                  </a>
                </div>
                <span className="font-sans text-[9px] tracking-widest" style={{ color: `${PARCH}25` }}>© {new Date().getFullYear()} {frontend.information.name}</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
