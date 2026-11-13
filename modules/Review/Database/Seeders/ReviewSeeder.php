<?php

namespace Modules\Review\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Product\Models\Product;
use Modules\Review\Enum\ReviewStatusEnum;
use Modules\Review\Models\Review;
use Modules\User\Models\User;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::query()->take(5)->get();
        if ($products->isEmpty()) {
            return;
        }

        $admin = User::query()->where('email', 'hamzajaffer789@gmail.com')->first()
            ?? User::query()->first();

        $sampleReviews = [
            [
                'rating' => 5,
                'title' => 'Stunning quality and fit!',
                'comment' => 'The fabric feels luxurious and the tailoring is exquisite. Received countless compliments wearing this.',
                'status' => ReviewStatusEnum::Approved,
                'admin_response' => 'Thank you so much for your kind words! We are delighted that you loved it.',
                'responded_at' => now(),
                'responded_by' => $admin?->id,
            ],
            [
                'rating' => 4,
                'title' => 'Great fabric, slightly long',
                'comment' => 'Beautiful dress, the material is top notch. Just had to get it hemmed slightly for my height.',
                'status' => ReviewStatusEnum::Approved,
                'admin_response' => 'Thank you for your feedback! We offer custom sizing options as well.',
                'responded_at' => now(),
                'responded_by' => $admin?->id,
            ],
            [
                'rating' => 5,
                'title' => 'Exceeded my expectations',
                'comment' => 'Fast delivery and premium packaging. The dress is even more gorgeous in person.',
                'status' => ReviewStatusEnum::Pending,
                'admin_response' => null,
                'responded_at' => null,
                'responded_by' => null,
            ],
            [
                'rating' => 2,
                'title' => 'Color did not match picture',
                'comment' => 'The color is slightly darker than what was shown on my screen. Quality is okay though.',
                'status' => ReviewStatusEnum::Pending,
                'admin_response' => null,
                'responded_at' => null,
                'responded_by' => null,
            ],
            [
                'rating' => 1,
                'title' => 'Wrong size delivered',
                'comment' => 'Ordered medium but received small. Need customer support to exchange quickly.',
                'status' => ReviewStatusEnum::Rejected,
                'admin_response' => 'We are so sorry for this mixup! Our support team has already reached out to arrange an express exchange.',
                'responded_at' => now(),
                'responded_by' => $admin?->id,
            ],
        ];

        foreach ($sampleReviews as $index => $reviewData) {
            $product = $products[$index % $products->count()];

            Review::query()->firstOrCreate(
                [
                    'product_id' => $product->id,
                    'title' => $reviewData['title'],
                ],
                [
                    ...$reviewData,
                    'user_id' => $admin?->id,
                    'author_name' => 'Demo Customer '.($index + 1),
                    'author_email' => 'customer'.($index + 1).'@example.com',
                ],
            );
        }
    }
}
