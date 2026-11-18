import { useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, MessageSquare, Star, User } from 'lucide-react';
import { useState } from 'react';

export type ReviewItem = {
    id: number;
    author_name: string;
    rating: number;
    title: string;
    comment: string;
    admin_response: string | null;
    created_at: string;
    created_at_human: string;
};

export type ProductReviewsData = {
    total_reviews: number;
    average_rating: number;
    rating_counts: Record<number, number>;
    rating_percentages: Record<number, number>;
    items: ReviewItem[];
};

type Props = {
    productSlug: string;
    reviewsData?: ProductReviewsData;
};

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
    const sizeCls = size === 'lg' ? 'size-5' : size === 'md' ? 'size-4' : 'size-3.5';

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${sizeCls} ${
                        star <= Math.round(rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-neutral-200 text-neutral-200'
                    }`}
                />
            ))}
        </div>
    );
}

export default function ProductReviews({ productSlug, reviewsData }: Props) {
    const page = usePage<{
        customer?: { name?: string; email?: string } | null;
        auth?: { user?: { name?: string; email?: string } | null };
        flash?: { success?: string; error?: string };
    }>();

    const loggedInUser = page.props.customer ?? page.props.auth?.user;

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const [submittedSuccess, setSubmittedSuccess] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        rating: 5,
        title: '',
        comment: '',
        author_name: loggedInUser?.name ?? '',
        author_email: loggedInUser?.email ?? '',
    });

    const total = reviewsData?.total_reviews ?? 0;
    const avg = reviewsData?.average_rating ?? 0;
    const items = reviewsData?.items ?? [];
    const counts = reviewsData?.rating_counts ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const percentages = reviewsData?.rating_percentages ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/products/${productSlug}/reviews`, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                reset('title', 'comment');
                setIsFormOpen(false);
                setSubmittedSuccess(true);
                setTimeout(() => setSubmittedSuccess(false), 6000);
            },
        });
    };

    return (
        <section className="mt-20 border-t border-neutral-200 pt-16 text-neutral-900">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-neutral-200">
                <div>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-neutral-900">
                        Customer Reviews
                    </h2>
                    <div className="mt-3 flex items-center gap-3">
                        <StarRating rating={avg} size="md" />
                        <span className="text-sm font-bold text-neutral-900">
                            {avg > 0 ? `${avg.toFixed(1)} / 5.0` : 'No reviews yet'}
                        </span>
                        {total > 0 && (
                            <span className="text-xs uppercase tracking-wider text-neutral-500">
                                ({total} {total === 1 ? 'review' : 'reviews'})
                            </span>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setIsFormOpen(!isFormOpen);
                        setSubmittedSuccess(false);
                    }}
                    className="inline-flex items-center justify-center bg-neutral-900 px-7 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors cursor-pointer self-start sm:self-auto"
                >
                    {isFormOpen ? 'Close Form' : 'Write a Review'}
                </button>
            </div>

            {/* Flash / Success Message */}
            {(submittedSuccess || page.props.flash?.success) && (
                <div className="mt-6 flex items-center gap-3 border border-neutral-900 bg-neutral-900 p-4 text-xs font-medium uppercase tracking-wider text-white">
                    <CheckCircle2 className="size-4 shrink-0 text-white" />
                    <span>
                        {page.props.flash?.success ?? 'Thank you! Your review has been submitted and posted.'}
                    </span>
                </div>
            )}

            {/* Storefront Styled Review Submission Form */}
            {isFormOpen && (
                <div className="mt-8 border border-neutral-300 bg-neutral-50/60 p-6 sm:p-10">
                    <div className="border-b border-neutral-200 pb-4 mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900">
                            Write Your Review
                        </h3>
                        <p className="mt-1 text-xs text-neutral-500">
                            Share your thoughts on the silhouette, fabric, fit, and craftsmanship.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Rating Picker */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2">
                                Overall Rating <span className="text-rose-600">*</span>
                            </label>
                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setData('rating', star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                                        aria-label={`Rate ${star} stars`}
                                    >
                                        <Star
                                            className={`size-6 ${
                                                star <= (hoverRating || data.rating)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'fill-neutral-200 text-neutral-200'
                                            }`}
                                        />
                                    </button>
                                ))}
                                <span className="ml-3 text-xs font-bold uppercase tracking-wider text-neutral-700">
                                    {hoverRating || data.rating} of 5 Stars
                                </span>
                            </div>
                            {errors.rating && (
                                <p className="mt-1.5 text-xs text-rose-600">{errors.rating}</p>
                            )}
                        </div>

                        {/* Author Name & Email */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="review_author_name"
                                    className="block text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-1.5"
                                >
                                    Your Name <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    id="review_author_name"
                                    type="text"
                                    value={data.author_name}
                                    onChange={(e) => setData('author_name', e.target.value)}
                                    placeholder="e.g. Ayesha Khan"
                                    required
                                    className="w-full border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none transition-colors"
                                />
                                {errors.author_name && (
                                    <p className="mt-1.5 text-xs text-rose-600">{errors.author_name}</p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="review_author_email"
                                    className="block text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-1.5"
                                >
                                    Email Address <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    id="review_author_email"
                                    type="email"
                                    value={data.author_email}
                                    onChange={(e) => setData('author_email', e.target.value)}
                                    placeholder="e.g. ayesha@example.com"
                                    required
                                    className="w-full border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none transition-colors"
                                />
                                {errors.author_email && (
                                    <p className="mt-1.5 text-xs text-rose-600">{errors.author_email}</p>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label
                                htmlFor="review_title"
                                className="block text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-1.5"
                            >
                                Review Headline <span className="text-rose-600">*</span>
                            </label>
                            <input
                                id="review_title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g. Flawless tailoring and exquisite hand-embroidery"
                                required
                                maxLength={150}
                                className="w-full border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none transition-colors"
                            />
                            {errors.title && (
                                <p className="mt-1.5 text-xs text-rose-600">{errors.title}</p>
                            )}
                        </div>

                        {/* Detailed Comment */}
                        <div>
                            <label
                                htmlFor="review_comment"
                                className="block text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-1.5"
                            >
                                Review Comments <span className="text-rose-600">*</span>
                            </label>
                            <textarea
                                id="review_comment"
                                rows={5}
                                value={data.comment}
                                onChange={(e) => setData('comment', e.target.value)}
                                placeholder="Describe the fabric quality, color fidelity, stitching details, and sizing..."
                                required
                                maxLength={2000}
                                className="w-full border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none transition-colors"
                            />
                            {errors.comment && (
                                <p className="mt-1.5 text-xs text-rose-600">{errors.comment}</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="border border-neutral-300 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-neutral-900 px-8 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Ratings Breakdown Grid */}
            {total > 0 && (
                <div className="mt-10 grid gap-8 border border-neutral-200 bg-white p-6 sm:p-8 md:grid-cols-12 md:items-center">
                    {/* Big Score on Left (4 cols) */}
                    <div className="flex flex-col items-center justify-center text-center md:col-span-4 md:border-r md:border-neutral-200 md:pr-8">
                        <span className="text-6xl font-light text-neutral-900">
                            {avg.toFixed(1)}
                        </span>
                        <div className="mt-2.5">
                            <StarRating rating={avg} size="md" />
                        </div>
                        <p className="mt-2 text-xs uppercase tracking-wider text-neutral-500">
                            Based on {total} {total === 1 ? 'rating' : 'ratings'}
                        </p>
                    </div>

                    {/* Bars Breakdown on Right (8 cols) */}
                    <div className="space-y-2 md:col-span-8 md:pl-4">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center gap-3 text-xs">
                                <span className="w-10 text-left font-semibold uppercase text-neutral-700">
                                    {star} Star
                                </span>
                                <div className="h-2 flex-1 overflow-hidden bg-neutral-100">
                                    <div
                                        className="h-full bg-neutral-900 transition-all duration-500"
                                        style={{ width: `${percentages[star] ?? 0}%` }}
                                    />
                                </div>
                                <span className="w-8 text-right font-mono text-neutral-400">
                                    {counts[star] ?? 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Approved Reviews Stream */}
            <div className="mt-12">
                {items.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-neutral-200">
                        <MessageSquare className="mx-auto size-7 text-neutral-300 mb-3" />
                        <p className="text-sm font-semibold uppercase tracking-wider text-neutral-800">
                            No Reviews Yet
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                            Be the first to share your thoughts on this garment.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-200">
                        {items.map((rev) => (
                            <article key={rev.id} className="py-8 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="grid size-8 place-items-center rounded-full bg-neutral-100 text-neutral-700">
                                            <User className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                                                {rev.author_name}
                                            </p>
                                            <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                                                Verified Client
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-neutral-400 font-mono">
                                        {rev.created_at_human}
                                    </span>
                                </div>

                                <StarRating rating={rev.rating} size="sm" />

                                {rev.title && (
                                    <h4 className="text-sm font-bold text-neutral-900 tracking-tight">
                                        {rev.title}
                                    </h4>
                                )}

                                <p className="text-sm leading-relaxed text-neutral-600 whitespace-pre-line font-light">
                                    {rev.comment}
                                </p>

                                {/* Admin response */}
                                {rev.admin_response && (
                                    <div className="mt-4 border-l-2 border-neutral-900 bg-neutral-50 p-4 text-xs">
                                        <p className="font-bold uppercase tracking-wider text-neutral-900">
                                            SK Couture House Response
                                        </p>
                                        <p className="mt-1.5 leading-relaxed text-neutral-600">
                                            {rev.admin_response}
                                        </p>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
