<?php

namespace Modules\Review\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Product\Models\Product;
use Modules\Review\Enum\ReviewStatusEnum;
use Modules\Review\Models\Review;
use Modules\User\Models\User;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'user_id' => User::factory(),
            'author_name' => fake()->name(),
            'author_email' => fake()->safeEmail(),
            'rating' => fake()->numberBetween(1, 5),
            'title' => fake()->sentence(4),
            'comment' => fake()->paragraph(),
            'status' => fake()->randomElement([ReviewStatusEnum::Pending, ReviewStatusEnum::Approved, ReviewStatusEnum::Rejected]),
            'admin_response' => null,
            'responded_at' => null,
            'responded_by' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (): array => [
            'status' => ReviewStatusEnum::Pending,
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn (): array => [
            'status' => ReviewStatusEnum::Approved,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (): array => [
            'status' => ReviewStatusEnum::Rejected,
        ]);
    }

    public function responded(string $response = 'Thank you for your valuable feedback!'): static
    {
        return $this->state(fn (): array => [
            'admin_response' => $response,
            'responded_at' => now(),
            'responded_by' => User::factory(),
        ]);
    }
}
