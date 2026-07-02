import { FabricCanvas } from '@/components/frontend/fabric-canvas';
import { Footer } from '@/components/frontend/footer';
import { Hero } from '@/components/frontend/hero';
import { Lookbook } from '@/components/frontend/look-book';
import { Navigation } from '@/components/frontend/navigation';
import { FabricCanvasItem, FeaturedCollection, FrontendData } from '@/types/auth';
import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

type PageProps = {
  frontendData: FrontendData | null;
  featuredCollection: FeaturedCollection | null;
  fabricCanvases: FabricCanvasItem[];
};

function Welcome() {
  const { frontendData, featuredCollection, fabricCanvases } = usePage<PageProps>().props;
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'lookbook', 'canvas', 'contact'];
      const pos = window.scrollY + 350;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && pos >= el.offsetTop && pos < el.offsetTop + el.offsetHeight) {
          setActiveSection(id);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#0b1a0d', color: '#f0ddb8' }}>

      {/* ── Velvet Library ambient light blobs ── */}
      {/* Forest green — top left */}
      <div className="absolute top-[5%] left-[8%] w-[55vw] h-[55vw] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(30,77,48,0.28) 0%, transparent 70%)' }} />
      {/* Antique brass — centre right */}
      <div className="absolute top-[30%] right-[3%] w-[45vw] h-[45vw] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(184,149,42,0.14) 0%, transparent 70%)' }} />
      {/* Oxblood — lower left */}
      <div className="absolute bottom-[28%] left-[2%] w-[40vw] h-[40vw] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(122,28,28,0.18) 0%, transparent 70%)' }} />
      {/* Walnut — bottom right */}
      <div className="absolute bottom-[5%] right-[8%] w-[35vw] h-[35vw] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(77,43,15,0.22) 0%, transparent 70%)' }} />

      <div className="bg-grain" />
      <Navigation activeSection={activeSection} />

      <main>
        <Hero frontendData={frontendData} featuredCollection={featuredCollection} />
        <Lookbook featuredCollection={featuredCollection} frontendData={frontendData} />
        <FabricCanvas fabricCanvases={fabricCanvases} frontendData={frontendData} />
      </main>
      <Footer />
    </div>
  );
}

export default Welcome
