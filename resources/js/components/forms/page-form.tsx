import ContentEditor from '@/components/forms/content-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Form } from '@inertiajs/react';
import { Lock, Save, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

export type PageData = {
    id?: number;
    title: string;
    slug: string;
    content: string;
    is_system?: boolean;
    is_active?: boolean;
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string | null;
    canonical_url?: string | null;
    og_image?: string | null;
    created_at?: string;
    updated_at?: string;
};

type Props = {
    page?: PageData | null;
    action: string;
    method?: 'post' | 'patch';
};

export default function PageForm({ page, action, method = 'post' }: Props) {
    const isEdit = Boolean(page?.id);
    const isSystem = Boolean(page?.is_system);

    const [title, setTitle] = useState(page?.title ?? '');
    const [slug, setSlug] = useState(page?.slug ?? '');
    const [content, setContent] = useState(page?.content ?? (isEdit ? '' : '<p>Write your page content here...</p>'));
    const [isActive, setIsActive] = useState(page?.is_active ?? true);
    const [metaTitle, setMetaTitle] = useState(page?.meta_title ?? '');
    const [metaDescription, setMetaDescription] = useState(page?.meta_description ?? '');
    const [metaKeywords, setMetaKeywords] = useState(page?.meta_keywords ?? '');
    const [canonicalUrl, setCanonicalUrl] = useState(page?.canonical_url ?? '');
    const [ogImage, setOgImage] = useState(page?.og_image ?? '');

    useEffect(() => {
        if (page) {
            setTitle(page.title ?? '');
            setSlug(page.slug ?? '');
            setContent(page.content ?? '');
            setIsActive(page.is_active ?? true);
            setMetaTitle(page.meta_title ?? '');
            setMetaDescription(page.meta_description ?? '');
            setMetaKeywords(page.meta_keywords ?? '');
            setCanonicalUrl(page.canonical_url ?? '');
            setOgImage(page.og_image ?? '');
        }
    }, [page]);

    const handleTitleChange = (val: string) => {
        setTitle(val);
        if (!isEdit && !slug) {
            setSlug(
                val
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, ''),
            );
        }
    };

    return (
        <Form action={action} method={method} className="grid gap-6 lg:grid-cols-3">
            {({ errors, processing }) => (
                <>
                    {/* Main Content Column */}
                    <div className="space-y-6 lg:col-span-2">
                        {isSystem && (
                            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3.5 text-xs text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400">
                                <Shield className="size-4 shrink-0" />
                                <div>
                                    <p className="font-semibold">System Protected Page</p>
                                    <p className="mt-0.5">
                                        The URL slug is locked to prevent broken store links. You can edit the content and SEO tags freely.
                                    </p>
                                </div>
                            </div>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Page Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Title */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="title">
                                        Page Title <span className="text-destructive">*</span>
                                    </Label>
                                    {isSystem && <input type="hidden" name="title" value={title} />}
                                    <Input
                                        id="title"
                                        name={isSystem ? undefined : 'title'}
                                        value={title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        readOnly={isSystem}
                                        className={isSystem ? 'bg-muted cursor-not-allowed opacity-80' : ''}
                                        placeholder="e.g. Terms & Conditions"
                                        autoFocus={!isEdit}
                                    />
                                    <InputError message={errors.title} />
                                    {isSystem && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Lock className="size-3" /> System page title is locked.
                                        </p>
                                    )}
                                </div>

                                {/* Slug */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="slug">URL Slug</Label>
                                    {isSystem && <input type="hidden" name="slug" value={slug} />}
                                    <div className="flex items-center rounded-md border overflow-hidden">
                                        <span className="border-r bg-muted px-3 py-2 text-xs text-muted-foreground">
                                            /page/
                                        </span>
                                        <Input
                                            id="slug"
                                            name={isSystem ? undefined : 'slug'}
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            readOnly={isSystem}
                                            className={`border-0 rounded-none focus-visible:ring-0 ${
                                                isSystem ? 'bg-muted cursor-not-allowed opacity-80' : ''
                                            }`}
                                            placeholder="terms-and-conditions"
                                        />
                                    </div>
                                    <InputError message={errors.slug} />
                                    {isSystem && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Lock className="size-3" /> System URLs cannot be changed.
                                        </p>
                                    )}
                                </div>

                                {/* Content with Visual (Jodit) & Code (Monaco) Editor */}
                                <ContentEditor
                                    value={content}
                                    onChange={setContent}
                                    error={errors.content}
                                />
                            </CardContent>
                        </Card>

                        {/* SEO Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">SEO Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="meta_title">Meta Title</Label>
                                    <Input
                                        id="meta_title"
                                        name="meta_title"
                                        value={metaTitle}
                                        onChange={(e) => setMetaTitle(e.target.value)}
                                        placeholder="SEO Title | SK Couture House"
                                        maxLength={255}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {metaTitle.length}/255 characters. Recommended: 50–60.
                                    </p>
                                    <InputError message={errors.meta_title} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="meta_description">Meta Description</Label>
                                    <textarea
                                        id="meta_description"
                                        name="meta_description"
                                        value={metaDescription}
                                        onChange={(e) => setMetaDescription(e.target.value)}
                                        rows={3}
                                        maxLength={500}
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="Snippet shown in search engine results..."
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {metaDescription.length}/500. Recommended: 120–160 characters.
                                    </p>
                                    <InputError message={errors.meta_description} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="meta_keywords">Meta Keywords</Label>
                                    <Input
                                        id="meta_keywords"
                                        name="meta_keywords"
                                        value={metaKeywords}
                                        onChange={(e) => setMetaKeywords(e.target.value)}
                                        placeholder="couture, bespoke, luxury"
                                        maxLength={500}
                                    />
                                    <InputError message={errors.meta_keywords} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="canonical_url">Canonical URL</Label>
                                    <Input
                                        id="canonical_url"
                                        name="canonical_url"
                                        type="url"
                                        value={canonicalUrl}
                                        onChange={(e) => setCanonicalUrl(e.target.value)}
                                        placeholder="https://example.com/page/your-page"
                                    />
                                    <InputError message={errors.canonical_url} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="og_image">OG Image URL</Label>
                                    <Input
                                        id="og_image"
                                        name="og_image"
                                        value={ogImage}
                                        onChange={(e) => setOgImage(e.target.value)}
                                        placeholder="https://example.com/images/og-preview.jpg"
                                    />
                                    <InputError message={errors.og_image} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Settings Column */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Publish Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Published</p>
                                        <p className="text-xs text-muted-foreground">
                                            {isActive ? 'Visible to customers' : 'Draft / hidden'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsActive(!isActive)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                            isActive ? 'bg-primary' : 'bg-muted-foreground/30'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                                isActive ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                                <input type="hidden" name="is_active" value={isActive ? '1' : '0'} />

                                {isEdit && page?.slug && (
                                    <div className="border-t pt-3">
                                        <p className="text-xs text-muted-foreground">
                                            Live URL:{' '}
                                            <a
                                                href={`/page/${page.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-mono text-primary hover:underline"
                                            >
                                                /page/{page.slug}
                                            </a>
                                        </p>
                                    </div>
                                )}

                                <Button type="submit" className="w-full" disabled={processing}>
                                    <Save className="mr-2 size-4" />
                                    {processing ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Page'}
                                </Button>
                            </CardContent>
                        </Card>

                        {isEdit && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Page Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-xs text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Type</span>
                                        <span className="font-semibold text-foreground">
                                            {isSystem ? 'System' : 'Custom'}
                                        </span>
                                    </div>
                                    {page?.created_at && (
                                        <div className="flex justify-between">
                                            <span>Created</span>
                                            <span>{page.created_at.slice(0, 10)}</span>
                                        </div>
                                    )}
                                    {page?.updated_at && (
                                        <div className="flex justify-between">
                                            <span>Last Updated</span>
                                            <span>{page.updated_at.slice(0, 10)}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </>
            )}
        </Form>
    );
}
