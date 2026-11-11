import { index } from '@/actions/Modules/Product/Http/Controller/ProductController';
import ProductForm from '@/components/forms/product-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import type { ProductFormOptions } from '@/types';
import { Head, router } from '@inertiajs/react';

type Props = {
    formOptions: ProductFormOptions;
};

export default function CreateProduct({ formOptions }: Props) {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title="Create product" />
            <header className="flex flex-wrap items-start justify-between gap-4">
                <Heading
                    title="Create product"
                    description="Add a product to your catalog, configure its pricing, and manage its variants."
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit(index.url())}
                >
                    Back to products
                </Button>
            </header>
            <ProductForm product={null} options={formOptions} />
        </div>
    );
}

CreateProduct.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/dashboard/product' },
        { title: 'Create', href: '/dashboard/product/create' },
    ],
};
