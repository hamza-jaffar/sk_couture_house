import Footer from '@/components/frontend/footer';
import Navbar from '@/components/frontend/navbar';
import type { ReactNode } from 'react';

export default function FrontendLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
