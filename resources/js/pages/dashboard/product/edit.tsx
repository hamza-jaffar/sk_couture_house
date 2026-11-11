import { index } from '@/actions/Modules/Product/Http/Controller/ProductController';
import ProductForm from '@/components/forms/product-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import type { ProductFormOptions, ProductRecord } from '@/types';
import { Head, router } from '@inertiajs/react';

type Props = {
    product: ProductRecord;
    formOptions: ProductFormOptions;
};

export default function EditProduct({ product, formOptions }: Props) {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title={`Edit ${product.title}`} />
            <header className="flex flex-wrap items-start justify-between gap-4">
                <Heading
                    title="Edit product"
                    description={`Update catalog information, pricing, images, and variants for ${product.title}.`}
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit(index.url())}
                >
                    Back to products
                </Button>
            </header>
            <ProductForm product={product} options={formOptions} />
        </div>
    );
}

EditProduct.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/dashboard/product' },
        { title: 'Edit', href: '/dashboard/product' },
    ],
};
