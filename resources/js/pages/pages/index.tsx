import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

type PageItem = {
    id?: number;
    name: string;
    title: string;
    slug: string;
    html: string;
};

type PageProps = {
    pages: Record<string, PageItem>;
};

const PageIndex = () => {
    const { pages } = usePage<PageProps>().props;
    const [formData, setFormData] = useState<Record<string, PageItem>>(pages);

    const handleChange = (key: string, field: keyof PageItem, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value,
            },
        }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/pages', formData, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Page Content" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold">Page Content</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage the privacy policy, rules and regulations, and policy pages from a single editor.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {Object.entries(formData).map(([key, value]) => (
                        <Card key={key}>
                            <CardHeader>
                                <CardTitle>{value.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor={`${key}-name`}>Display Name</Label>
                                    <Input
                                        id={`${key}-name`}
                                        value={value.name}
                                        onChange={(e) => handleChange(key, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor={`${key}-title`}>Page Title</Label>
                                    <Input
                                        id={`${key}-title`}
                                        value={value.title}
                                        onChange={(e) => handleChange(key, 'title', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor={`${key}-html`}>Content</Label>
                                    <div className="overflow-hidden rounded-md border bg-background">
                                        <ReactQuill
                                            theme="snow"
                                            value={value.html}
                                            onChange={(content) => handleChange(key, 'html', content)}
                                            className="min-h-64"
                                            modules={{
                                                toolbar: [
                                                    [{ header: [1, 2, 3, false] }],
                                                    ['bold', 'italic', 'underline', 'strike'],
                                                    [{ list: 'ordered' }, { list: 'bullet' }],
                                                    ['link', 'blockquote', 'code-block'],
                                                    ['clean'],
                                                ],
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Use the rich-text toolbar to build polished content for this page.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <div className="flex justify-end">
                        <Button type="submit">Save Pages</Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default PageIndex;
