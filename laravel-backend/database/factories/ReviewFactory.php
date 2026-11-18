<?php

namespace Database\Factories;

use App\Models\Review;
use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
         return [
            'user_id' => User::factory(),
            'product_id' => Product::factory(),
            'rating' => fake()->numberBetween(1, 5),
            'comment' => fake()->randomElement([
                'Great product and good quality.',
                'I am happy with this product.',
                'The product works as expected.',
                'Good quality for the price.',
                'Fast delivery and good product.',
                'I would recommend this product.',
                'The product is useful and reliable.',
                'Good product but the delivery was slow.',
            ]),
        ];
    }
}