import Navbar from '@/components/frontend/navbar';
import { Head, Link, useForm } from '@inertiajs/react';

interface Props {
    errors?: Record<string, string>;
}

export default function CustomerLogin({ errors = {} }: Props) {
    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/customer/login');
    };    return (
        <div className="min-h-screen bg-white text-neutral-900">
            <Head title="Customer Login" />
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="mb-8 flex items-center text-xs tracking-wider text-neutral-500 uppercase">
                    <Link href="/" className="hover:text-black">
                        Home
                    </Link>
                    <span className="mx-2 text-neutral-300">/</span>
                    <span className="text-black">Sign In</span>
                </nav>

                <div className="mx-auto max-w-md">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 uppercase">
                            Sign In
                        </h1>
                        <p className="mt-1 text-xs tracking-widest text-neutral-500 uppercase">
                            Access your account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                placeholder="you@example.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center gap-2">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="size-3.5 accent-neutral-900"
                            />
                            <label
                                htmlFor="remember"
                                className="text-xs font-semibold uppercase tracking-wider text-neutral-700 cursor-pointer"
                            >
                                Remember Me
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-neutral-900 py-3.5 text-xs font-bold tracking-widest text-white uppercase hover:bg-black transition-colors disabled:opacity-60"
                        >
                            {processing ? 'Signing In…' : 'Sign In'}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="mt-6 space-y-3 border-t border-neutral-200 pt-6 text-center">
                        <p className="text-xs text-neutral-500">
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="font-semibold text-neutral-900 underline hover:text-black"
                            >
                                Create Account
                            </Link>
                        </p>
                        <p className="text-[11px] text-neutral-400">
                            Staff login at{' '}
                            <Link
                                href="/login?for=staff"
                                className="underline hover:text-neutral-700"
                            >
                                /login?for=staff
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
