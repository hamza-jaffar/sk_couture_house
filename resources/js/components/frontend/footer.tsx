import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BG, BRASS, BRASS_L, FOREST, OXBLOOD, PARCH, WALNUT } from '@/constant/colors';
import { usePage, useForm } from '@inertiajs/react';
import { Frontend } from '@/types';
import { FabricCanvasItem } from '@/types/auth';
import { socialPlatformMapping } from '@/constant/mapping';

const AVAILABLE_COLORS = [BRASS_L, OXBLOOD, FOREST];

type PageProps = {
  frontend: Frontend;
  fabricCanvases: FabricCanvasItem[];
};

export const Footer: React.FC = () => {
  const { frontend, fabricCanvases } = usePage<PageProps>().props;

  const socials = Object.entries(frontend.information)
    .filter(([key, value]) => socialPlatformMapping[key] && value)
    .map(([key, value]) => {
      const randomColor = AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)];

      return {
        name: socialPlatformMapping[key],
        link: value,
        col: randomColor
      };
    });

  const [sent, setSent] = useState(false);
  const { data, setData, post, processing, reset } = useForm({
    name: '',
    email: '',
    fabric: '',
    date: '',
    notes: ''
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/invitations', {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setSent(true);
      },
    });
  };

  return (
    <footer id="contact" className="pt-32 pb-12 relative overflow-hidden editorial-grid"
      style={{ borderTop: `1px solid rgba(184,149,42,0.2)`, background: `linear-gradient(180deg, ${BG} 0%, #0e2010 55%, ${BG} 100%)` }}
    >
      {/* Ambient blobs */}
      <div className="absolute bottom-[10%] right-[5%] w-125 h-125 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(30,77,48,0.20) 0%, transparent 70%)' }} />
      <div className="absolute top-[10%] left-[5%] w-100 h-100 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,149,42,0.12) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[30%] left-[15%] w-75 h-75 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(122,28,28,0.12) 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full z-10 relative">

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-24 items-start">

          {/* ── Booking form ── */}
          <div className="lg:col-span-6 p-8 md:p-12 backdrop-blur-md relative"
            style={{ background: 'rgba(13,24,14,0.72)', border: `1px solid rgba(184,149,42,0.22)` }}
          >
            {/* Forest→Oxblood→Walnut→Brass top bar */}
            <div className="absolute top-0 left-0 right-0 h-0.75"
              style={{ background: `linear-gradient(90deg, ${FOREST}, ${OXBLOOD}, ${WALNUT}, ${BRASS})` }} />
            <div className="absolute inset-0 bg-grain pointer-events-none opacity-5" />

            <span className="font-sans text-[10px] tracking-widest uppercase block mb-2"
              style={{ background: `linear-gradient(90deg, ${BRASS}, ${BRASS_L})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              APPOINTMENT BOOKING
            </span>
            <h3 className="font-serif text-3xl font-light uppercase tracking-wide mb-8" style={{ color: PARCH }}>{frontend.information.name} Request</h3>

            <AnimatePresence mode="wait">
              {!sent ? (
                <motion.form key="form" onSubmit={submit} initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { label: 'Full Name', type: 'text', key: 'name', placeholder: 'Jean Laurent', col: BRASS },
                      { label: 'Email Address', type: 'email', key: 'email', placeholder: 'jean.laurent@outlook.com', col: FOREST },
                    ].map(({ label, type, key, placeholder, col }) => (
                      <div key={key} className="space-y-1">
                        <label className="text-[9px] tracking-widest uppercase block" style={{ color: col, opacity: 0.75 }}>{label}</label>
                        <input type={type} required value={data[key as keyof typeof data]}
                          onChange={e => setData(key as keyof typeof data, e.target.value)}
                          className="w-full bg-transparent text-sm py-2 outline-none transition-all duration-300"
                          style={{ color: PARCH, borderBottom: `1px solid rgba(184,149,42,0.22)` }}
                          placeholder={placeholder}
                          onFocus={e => { e.target.style.borderBottomColor = col; }}
                          onBlur={e => { e.target.style.borderBottomColor = 'rgba(184,149,42,0.22)'; }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[9px] tracking-widest uppercase block" style={{ color: OXBLOOD, opacity: 0.8 }}>Fabric Matrix Focus</label>
                      <select value={data.fabric} onChange={e => setData('fabric', e.target.value)}
                        className="w-full text-xs py-2 uppercase tracking-widest cursor-pointer outline-none"
                        style={{ background: 'rgba(13,24,14,0.9)', color: `${PARCH}CC`, borderBottom: `1px solid rgba(122,28,28,0.35)` }}
                      >
                        <option value="">Select a Fabric</option>
                        {fabricCanvases && fabricCanvases.map(fabric => (
                          <option key={fabric.id} value={fabric.name.toLowerCase()}>{fabric.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] tracking-widest uppercase block" style={{ color: WALNUT, opacity: 0.85 }}>Preferred Consultation Date</label>
                      <input type="date" value={data.date} onChange={e => setData('date', e.target.value)}
                        className="w-full bg-transparent text-xs py-2 outline-none"
                        style={{ color: `${PARCH}CC`, borderBottom: `1px solid rgba(92,51,23,0.40)`, colorScheme: 'dark' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] tracking-widest uppercase block" style={{ color: BRASS_L, opacity: 0.75 }}>Measurements / Aesthetic Notes</label>
                    <textarea rows={3} value={data.notes} onChange={e => setData('notes', e.target.value)}
                      className="w-full bg-transparent text-sm py-2 outline-none resize-none"
                      style={{ color: PARCH, borderBottom: `1px solid rgba(184,149,42,0.22)` }}
                      placeholder="e.g. Sculpted shoulder suit request, chest measurement..."
                    />
                  </div>

                  <button type="submit" disabled={processing}
                    className="w-full font-sans text-xs uppercase tracking-[0.25em] py-4 cursor-pointer focus:outline-none font-medium transition-all duration-500 disabled:opacity-50"
                    style={{ background: `linear-gradient(90deg, ${FOREST}, ${OXBLOOD}, ${WALNUT})`, color: PARCH, boxShadow: `0 0 28px rgba(30,77,48,0.30)` }}
                  >
                    {processing ? 'REGISTERING DETAILED CONFIGS...' : `REQUEST ${frontend.information.name} INVITATION`}
                  </button>
                </motion.form>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }} className="space-y-6 py-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ border: `1px solid ${BRASS}`, boxShadow: `0 0 20px ${BRASS}40`, color: BRASS }}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-serif text-2xl font-light uppercase tracking-wide" style={{ color: PARCH }}>Invitation Sent</h4>
                  <p className="font-sans text-xs leading-relaxed uppercase tracking-wider max-w-sm mx-auto" style={{ color: `${PARCH}70` }}>
                    Your request for an aesthetic consultation is registered. We will send an official stamped invitation card within 24 hours.
                  </p>
                  <button onClick={() => { reset(); setSent(false); }}
                    className="text-xs uppercase tracking-widest focus:outline-none mt-6 transition-opacity hover:opacity-80"
                    style={{ color: BRASS_L }}
                  >
                    Send another request
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: headline + press ── */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-16">

            {/* Big statement */}
            <div className="space-y-6">
              <h2 className="font-serif text-5xl md:text-6xl font-light uppercase leading-[1.05] tracking-tight" style={{ color: PARCH }}>
                Let's shape <br />
                <span className="italic font-normal"
                  style={{ background: `linear-gradient(90deg, ${BRASS}, ${BRASS_L})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  silhouettes
                </span>{' '}
                <br />together.
              </h2>
              <div className="w-16 h-0.5" style={{ background: `linear-gradient(90deg, ${FOREST}, ${OXBLOOD}, ${WALNUT}, ${BRASS})` }} />
            </div>

            {/* Contact info */}
            <div className="grid grid-cols-2 gap-8 text-xs uppercase tracking-widest">
              <div>
                <span className="block text-[8px] mb-2 tracking-[0.25em]" style={{ color: BRASS, opacity: 0.65 }}>{frontend.information.name} CONTACT</span>
                <p className="font-serif lowercase tracking-normal text-sm mb-1" style={{ color: PARCH }}>{frontend.information.email}m</p>
                <p style={{ color: `${PARCH}60` }}>{frontend.information.phone_number}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-[10px] tracking-widest uppercase"
          style={{ borderTop: `1px solid rgba(184,149,42,0.15)`, color: `${PARCH}30` }}
        >
          <span>© {new Date().getFullYear()} {frontend.information.name}. ALL RIGHTS RESERVED.</span>
          <div className="flex space-x-8">
            {socials.map(({ name, link, col }) => (
              <a key={name} href={link} className="transition-colors duration-300"
                style={{ color: `${PARCH}30` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = col; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = `${PARCH}30`; }}
              >
                {name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
