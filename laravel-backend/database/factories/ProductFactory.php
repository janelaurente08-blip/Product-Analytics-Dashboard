<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
         $products = [
            'Wireless Headphones',
            'Bluetooth Speaker',
            'USB Keyboard',
            'Wireless Mouse',
            'Laptop Stand',
            'Smart Watch',
            'Phone Charger',
            'Power Bank',
            'Laptop Bag',
            'Cotton Shirt',
            'Denim Jeans',
            'Running Shoes',
            'Sports Jacket',
            'Backpack',
            'Novel Book',
            'Programming Book',
            'Notebook',
            'Desk Lamp',
            'Electric Fan',
            'Coffee Maker',
            'Water Bottle',
            'Basketball',
            'Yoga Mat',
            'Face Wash',
            'Body Lotion',
            'Hair Shampoo',
            'Toy Car',
            'Puzzle Game',
            'Office Chair',
            'Study Table',
        ];

        return [
            'category_id' => Category::factory(),
            'name' => fake()->randomElement($products),
            'description' => fake()->randomElement([
                'A high-quality product for everyday use.',
                'A durable and affordable product.',
                'A useful product with a simple design.',
                'A popular product for home and personal use.',
                'A reliable product made for everyday activities.',
            ]),
            'price' => fake()->randomFloat(2, 5, 500),
        ];
    }
}