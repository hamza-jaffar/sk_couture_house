import FrontendBackground from '@/components/fronted-background';
import { FabricCanvas } from '@/components/frontend/fabric-canvas';
import { Footer } from '@/components/frontend/footer';
import { Hero } from '@/components/frontend/hero';
import { Lookbook } from '@/components/frontend/look-book';
import { Navigation } from '@/components/frontend/navigation';
import { CategoryType, FabricCanvasItem, FeaturedCollection, FrontendData } from '@/types/auth';
import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

type PageProps = {
  frontendData: FrontendData | null;
  featuredCollection: FeaturedCollection | null;
  categories: CategoryType[];
  fabricCanvases: FabricCanvasItem[];
};

function Welcome() {
  const { frontendData, featuredCollection, categories, fabricCanvases } = usePage<PageProps>().props;
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

      <FrontendBackground />
      <Navigation activeSection={activeSection} />

      <main>
        <Hero frontendData={frontendData} featuredCollection={featuredCollection} />
        <Lookbook featuredCollection={featuredCollection} categories={categories} frontendData={frontendData} />
        <FabricCanvas fabricCanvases={fabricCanvases} frontendData={frontendData} />
      </main>
      <Footer />
    </div>
  );
}

export default Welcome
