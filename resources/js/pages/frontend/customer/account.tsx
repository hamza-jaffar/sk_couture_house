import Navbar from '@/components/frontend/navbar';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface ShippingAddress {
    line1: string;
    city: string;
    region: string;
    postal_code: string;
    country: string;
}

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    shipping_address: ShippingAddress | null;
    created_at: string;
}

interface Stats {
    total_orders: number;
    total_spent: number;
    pending_orders: number;
    completed_orders: number;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    status_label: string;
    status_color: string;
    total: number;
    currency_icon: string;
    created_at_human: string;
    items_count: number;
}

interface Props {
    customer: Customer;
    stats: Stats;
    recent_orders: Order[];
    errors?: Record<string, string>;
    flash?: { success?: string; error?: string };
}

export default function CustomerAccount({ customer, stats, recent_orders, errors = {}, flash }: Props) {
    const addr = customer.shipping_address;

    // Profile form state
    const [profile, setProfile] = useState({
        name: customer.name,
        phone: customer.phone ?? '',
        line1: addr?.line1 ?? '',
        city: addr?.city ?? '',
        region: addr?.region ?? '',
        postal_code: addr?.postal_code ?? '',
        country: addr?.country ?? 'Pakistan',
    });

    // Password form state
    const [pwForm, setPwForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [profileProcessing, setProfileProcessing] = useState(false);
    const [pwProcessing, setPwProcessing] = useState(false);

    const formatPrice = (amount: number, icon = 'Rs.') =>
        `${icon}${amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProfileProcessing(true);
        router.patch(
            '/customer/profile',
            {
                name: profile.name,
                phone: profile.phone,
                shipping_address: {
                    line1: profile.line1,
                    city: profile.city,
                    region: profile.region,
                    postal_code: profile.postal_code,
                    country: profile.country,
                },
            },
            {
                preserveScroll: true,
                onFinish: () => setProfileProcessing(false),
            },
        );
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPwProcessing(true);
        router.put('/customer/password', pwForm, {
            preserveScroll: true,
            onFinish: () => {
                setPwProcessing(false);
                setPwForm({ current_password: '', password: '', password_confirmation: '' });
            },
        });
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to sign out?')) {
            router.post('/customer/logout');
        }
    };

    const statCards = [
        { label: 'Total Orders', value: stats.total_orders },
        { label: 'Total Spent', value: formatPrice(stats.total_spent) },
        { label: 'Pending', value: stats.pending_orders },
        { label: 'Completed', value: stats.completed_orders },
    ];

    return (
        <div className="min-h-screen bg-white text-neutral-900">
            <Head title="My Account" />
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="mb-8 flex items-center text-xs tracking-wider text-neutral-500 uppercase">
                    <Link href="/" className="hover:text-black">Home</Link>
                    <span className="mx-2 text-neutral-300">/</span>
                    <span className="text-black">My Account</span>
                </nav>

                {/* Header */}
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 uppercase">
                            My Account
                        </h1>
                        <p className="mt-1 text-xs tracking-widest text-neutral-500 uppercase">
                            Welcome back, {customer.name}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="text-xs font-semibold tracking-wider text-neutral-500 uppercase hover:text-rose-600 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="mb-6 border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-6 border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 uppercase tracking-wider">
                        {flash.error}
                    </div>
                )}

                {/* Stats cards */}
                <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className="border border-neutral-200 bg-neutral-50/50 p-5"
                        >
                            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                {card.label}
                            </p>
                            <p className="mt-2 text-xl font-bold text-neutral-900">{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Forms — two columns on large screens */}
                <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Profile & Shipping */}
                    <div>
                        <h2 className="text-sm font-bold tracking-widest text-neutral-900 uppercase pb-3 border-b border-neutral-200 mb-6">
                            Profile &amp; Shipping Address
                        </h2>
                        <form onSubmit={handleProfileSubmit} className="space-y-5">
                            {/* Name */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                />
                                {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                                    Phone{' '}
                                    <span className="font-normal normal-case tracking-normal text-neutral-400">(optional)</span>
                                </label>
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                />
                                {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
                            </div>

                            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 pt-1">
                                Shipping Address
                            </p>

                            {/* Address Line 1 */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    value={profile.line1}
                                    onChange={(e) => setProfile({ ...profile, line1: e.target.value })}
                                    className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                    placeholder="123 Main St"
                                />
                                {errors['shipping_address.line1'] && (
                                    <p className="mt-1 text-xs text-rose-600">{errors['shipping_address.line1']}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* City */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700">City</label>
                                    <input
                                        type="text"
                                        value={profile.city}
                                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                        className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                        placeholder="Lahore"
                                    />
                                </div>
                                {/* Region */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                                        Region / Province
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.region}
                                        onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                                        className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                        placeholder="Punjab"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Postal Code */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.postal_code}
                                        onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                                        className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                        placeholder="54000"
                                    />
                                </div>
                                {/* Country */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700">Country</label>
                                    <input
                                        type="text"
                                        value={profile.country}
                                        onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                                        className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                        placeholder="Pakistan"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={profileProcessing}
                                className="bg-neutral-900 py-3.5 text-xs font-bold tracking-widest text-white uppercase hover:bg-black transition-colors disabled:opacity-60 px-8"
                            >
                                {profileProcessing ? 'Saving…' : 'Save Profile'}
                            </button>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div>
                        <h2 className="text-sm font-bold tracking-widest text-neutral-900 uppercase pb-3 border-b border-neutral-200 mb-6">
                            Change Password
                        </h2>
                        <form onSubmit={handlePasswordSubmit} className="space-y-5">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={pwForm.current_password}
                                    onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                                    className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                    placeholder="••••••••"
                                />
                                {errors.current_password && (
                                    <p className="mt-1 text-xs text-rose-600">{errors.current_password}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={pwForm.password}
                                    onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })}
                                    className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                    placeholder="••••••••"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={pwForm.password_confirmation}
                                    onChange={(e) => setPwForm({ ...pwForm, password_confirmation: e.target.value })}
                                    className="w-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                                    placeholder="••••••••"
                                />
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-xs text-rose-600">{errors.password_confirmation}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={pwProcessing}
                                className="bg-neutral-900 py-3.5 text-xs font-bold tracking-widest text-white uppercase hover:bg-black transition-colors disabled:opacity-60 px-8"
                            >
                                {pwProcessing ? 'Updating…' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Recent Orders */}
                <div>
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-6">
                        <h2 className="text-sm font-bold tracking-widest text-neutral-900 uppercase">
                            Recent Orders
                        </h2>
                        <Link
                            href="/customer/orders"
                            className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-black underline"
                        >
                            View All
                        </Link>
                    </div>

                    {recent_orders.length === 0 ? (
                        <p className="text-sm text-neutral-500">No orders yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200">
                                        <th className="pb-3 pr-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            Order
                                        </th>
                                        <th className="pb-3 pr-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            Date
                                        </th>
                                        <th className="pb-3 pr-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            Status
                                        </th>
                                        <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 text-right">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {recent_orders.map((order) => (
                                        <tr key={order.id} className="group">
                                            <td className="py-4 pr-6">
                                                <Link
                                                    href={`/customer/orders/${order.order_number}`}
                                                    className="font-semibold text-neutral-900 hover:underline"
                                                >
                                                    #{order.order_number}
                                                </Link>
                                            </td>
                                            <td className="py-4 pr-6 text-neutral-500 text-xs">
                                                {order.created_at_human}
                                            </td>
                                            <td className="py-4 pr-6">
                                                <span
                                                    className="inline-block rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                                                    style={{ backgroundColor: order.status_color }}
                                                >
                                                    {order.status_label}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right font-semibold text-neutral-900">
                                                {formatPrice(order.total, order.currency_icon)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
