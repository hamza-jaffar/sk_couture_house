import { Head, usePage } from '@inertiajs/react';
import { Navigation } from '@/components/frontend/navigation';
import { Footer } from '@/components/frontend/footer';
import type { FrontendData } from '@/types/auth';
import { FOREST, OXBLOOD } from '@/constant/colors';
import FrontendBackground from '@/components/fronted-background';

type PageProps = {
    page: {
        title: string;
        html: string;
    };
    frontendData?: FrontendData | null;
};

/**
 * Public page view — rewritten to match frontend layout and spacing.
 * - Large serif title
 * - Centered content column for comfortable reading
 * - Uses `custom-page` to neutralize pasted inline styles
 */
const PageShow = () => {
    const { page } = usePage<PageProps>().props;

    return (
        <div className="relative min-h-screen overflow-x-hidden selection:bg-amber-900/30" style={{ background: '#0b1a0d', color: '#f0ddb8' }}>
            <Head title={page.title} />

            {/* Ambient Background Glows */}
            <FrontendBackground />

            <Navigation activeSection="" />

            {/* Main Content Section */}
            <section className="relative z-10 max-w-7xl w-full min-h-screen mx-auto px-4 mt-24 pt-6">
                <div className='text-center font-serif'>
                    <h1 className='text-5xl'>{page.title}</h1>
                </div>
                <div>
                    <div
                        className="w-full wrap-break-word space-y-4"
                        dangerouslySetInnerHTML={{ __html: page.html }}
                    />
                </div>
            </section>
        </div>
    );
};

export default PageShow;

