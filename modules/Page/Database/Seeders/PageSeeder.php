<?php

namespace Modules\Page\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Page\Models\Page;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $systemPages = [
            [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'is_system' => true,
                'is_active' => true,
                'meta_title' => 'Privacy Policy | SK Couture House',
                'meta_description' => 'Learn how SK Couture House collects, protects, and handles your personal information with complete transparency and care.',
                'meta_keywords' => 'privacy policy, data protection, customer privacy, sk couture',
                'content' => '<h2>Privacy Policy</h2><p>Welcome to SK Couture House. We are committed to protecting your personal data and respecting your privacy. This policy explains how we collect, store, and utilize your information when you visit our store or purchase bespoke garments.</p><h3>Information We Collect</h3><p>We collect information such as your name, contact details, shipping address, and sizing measurements to process orders, fulfill tailoring specifications, and enhance your shopping experience.</p><h3>Data Security</h3><p>Your payment transactions and sensitive data are processed using industry-standard encrypted communication channels. We never sell or share your private information with unauthorized third parties.</p>',
            ],
            [
                'title' => 'Terms & Conditions',
                'slug' => 'terms-and-conditions',
                'is_system' => true,
                'is_active' => true,
                'meta_title' => 'Terms & Conditions | SK Couture House',
                'meta_description' => 'Review the terms and conditions governing purchases, custom orders, and website usage at SK Couture House.',
                'meta_keywords' => 'terms and conditions, store policy, custom tailoring agreement',
                'content' => '<h2>Terms and Conditions</h2><p>By accessing or purchasing from SK Couture House, you agree to comply with our store policies, bespoke craftsmanship terms, and website guidelines.</p><h3>Custom Tailoring & Bespoke Orders</h3><p>Because bespoke and customized garments are handcrafted specifically to client measurements, alterations and production times may vary. Orders placed and confirmed cannot be cancelled once production commences.</p><h3>Pricing & Currency</h3><p>All prices displayed are denominated in Pakistan Rupees (PKR) unless indicated otherwise. We reserve the right to amend pricing, specifications, and availability without prior notice.</p>',
            ],
            [
                'title' => 'Refund & Exchange Policy',
                'slug' => 'refund-policy',
                'is_system' => true,
                'is_active' => true,
                'meta_title' => 'Refund & Exchange Policy | SK Couture House',
                'meta_description' => 'Understand our policies regarding refunds, alterations, and exchanges for ready-to-wear and bespoke couture.',
                'meta_keywords' => 'refund policy, exchange, returns, alterations, couture returns',
                'content' => '<h2>Refund and Exchange Policy</h2><p>At SK Couture House, we pride ourselves on exceptional craftsmanship and client satisfaction. Please review our guidelines for returns and exchanges below.</p><h3>Ready-to-Wear Items</h3><p>Ready-to-wear pieces may be exchanged within 7 days of delivery provided they are unworn, unaltered, and retained with original luxury packaging and tags.</p><h3>Bespoke & Custom Orders</h3><p>Custom-tailored items are non-refundable. However, we offer complimentary alterations within 14 days of delivery to ensure a flawless fit.</p>',
            ],
            [
                'title' => 'Shipping & Delivery',
                'slug' => 'shipping-policy',
                'is_system' => true,
                'is_active' => true,
                'meta_title' => 'Shipping & Delivery Information | SK Couture House',
                'meta_description' => 'Details on national and international delivery times, bespoke transit care, and courier tracking.',
                'meta_keywords' => 'shipping, delivery, courier, international shipping, couture transit',
                'content' => '<h2>Shipping & Delivery</h2><p>Every piece from SK Couture House is inspected with meticulous detail and packaged securely for premium delivery.</p><h3>Domestic Delivery</h3><p>Domestic shipments within Pakistan typically arrive within 3 to 5 business days after fulfillment. For custom bridal and bespoke collections, delivery timelines are agreed upon at order placement.</p><h3>Order Tracking</h3><p>Once your order is dispatched, a tracking reference will be provided via email or SMS to monitor your shipment in real time.</p>',
            ],
            [
                'title' => 'About Us',
                'slug' => 'about-us',
                'is_system' => true,
                'is_active' => true,
                'meta_title' => 'About SK Couture House | Bespoke Elegance & Heritage',
                'meta_description' => 'Discover the story, craftsmanship, and heritage behind SK Couture House.',
                'meta_keywords' => 'about sk couture, bespoke fashion, haute couture, heritage craftsmanship',
                'content' => '<h2>The Art of Haute Couture</h2><p>SK Couture House stands as a testament to bespoke luxury, timeless elegance, and traditional craftsmanship merged with contemporary silhouettes.</p><p>Founded with a passion for haute couture, each garment in our collection is handcrafted by master artisans utilizing the finest fabrics, intricate hand-embroidery, and precise tailoring.</p>',
            ],
        ];

        foreach ($systemPages as $pageData) {
            Page::query()->firstOrCreate(
                ['slug' => $pageData['slug']],
                $pageData,
            );
        }
    }
}
