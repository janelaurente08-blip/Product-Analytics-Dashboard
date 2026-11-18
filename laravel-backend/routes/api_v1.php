<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ProductController;
use App\Models\Category;

// Authenticated user
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// STEP 4 - Display all products
Route::get('/products', [
    ProductController::class,
    'index'
])->name('products.index');

// STEP 6 - Execute all product queries
// Must be before /products/{product}
Route::get('/products/queries', [
    ProductController::class,
    'query'
])->name('products.queries');

// STEP 5 - Display one product
Route::get('/products/{product}', [
    ProductController::class,
    'show'
])->whereNumber('product')
  ->name('products.show');

// Category route for ProductResource links
Route::get('/categories/{category}', function (
    Category $category
) {
    return response()->json([
        'data' => $category,
        'message' => 'Category retrieved successfully',
        'status' => 200,
    ]);
})->whereNumber('category')
  ->name('categories.show');
