import { Head, Link, useForm } from '@inertiajs/react';

interface Props {
    errors?: Record<string, string>;
}

export default function CustomerRegister({ errors = {} }: Props) {
    const { data, setData, post, processing } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className="min-h-screen bg-white text-neutral-900">
            <Head title="Create Account" />

            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="mb-8 flex items-center text-xs tracking-wider text-neutral-500 uppercase">
                    <Link href="/" className="hover:text-black">
                        Home
                    </Link>
                    <span className="mx-2 text-neutral-300">/</span>
                    <span className="text-black">Create Account</span>
                </nav>

                <div className="mx-auto max-w-md">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 uppercase">
                            Create Account
                        </h1>
                        <p className="mt-1 text-xs tracking-widest text-neutral-500 uppercase">
                            Join SK Couture House
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700"
                            >
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                autoComplete="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                placeholder="Your full name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
                            )}
                        </div>

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

                        {/* Phone (optional) */}
                        <div>
                            <label
                                htmlFor="phone"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700"
                            >
                                Phone{' '}
                                <span className="font-normal normal-case tracking-normal text-neutral-400">
                                    (optional)
                                </span>
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                autoComplete="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                placeholder="+92 300 0000000"
                            />
                            {errors.phone && (
                                <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
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
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                placeholder="••••••••"
                            />
                            {errors.password_confirmation && (
                                <p className="mt-1 text-xs text-rose-600">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-neutral-900 py-3.5 text-xs font-bold tracking-widest text-white uppercase hover:bg-black transition-colors disabled:opacity-60"
                        >
                            {processing ? 'Creating Account…' : 'Create Account'}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="mt-6 border-t border-neutral-200 pt-6 text-center">
                        <p className="text-xs text-neutral-500">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="font-semibold text-neutral-900 underline hover:text-black"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
