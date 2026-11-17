import Navbar from '@/components/frontend/navbar';
import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-background overflow-x-hidden">
                <Navbar />
                <main className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
                    <p className="text-center text-muted-foreground">
                        Welcome to the store.
                    </p>
                </main>
            </div>
        </>
    );
}
