<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ProductResource;
use App\Models\Product;
use App\Traits\ApiResponses;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    use ApiResponses;

    // ============================================
    // STEP 4 - DISPLAY ALL PRODUCTS
    // WITH PAGINATION
    // ============================================

    public function index()
    {
        $products = Product::with('category')
            ->orderBy('id', 'asc')
            ->paginate(10);

        return $this->ok(
            'Products retrieved successfully',
            [
                'products' => ProductResource::collection(
                    $products->getCollection()
                ),

                'pagination' => [
                    'current_page' => $products->currentPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                    'last_page' => $products->lastPage(),
                    'first_page_url' => $products->url(1),
                    'last_page_url' => $products->url(
                        $products->lastPage()
                    ),
                    'next_page_url' => $products->nextPageUrl(),
                    'prev_page_url' => $products->previousPageUrl(),
                ],
            ]
        );
    }

    // ============================================
    // STEP 5 - DISPLAY ONE PRODUCT
    // FIXES THE MISSING show() ERROR
    // ============================================

    public function show(Product $product)
    {
        $product->load('category');

        return $this->ok(
            'Product retrieved successfully',
            new ProductResource($product)
        );
    }

    // ============================================
    // STEP 6 - ELOQUENT QUERY METHOD
    // ============================================

    public function query()
    {
        // ========================================
        // A. QUERYING TABLES
        // ========================================

        // 1. Get product names and prices
        $nameAndPrice = Product::select(
            'name',
            'price'
        )->get();

        // 2. Get products with their categories
        $productsWithCategory = Product::with(
            'category'
        )->get();

        // 3. Get product IDs and names,
        // ordered by price ascending
        $productsOrderedByPrice = Product::select(
            'id',
            'name'
        )
            ->orderBy('price', 'asc')
            ->get();

        // 4. Get the first five products
        $firstFiveProducts = Product::limit(5)
            ->get();

        // ========================================
        // B. FILTERING DATA
        // ========================================

        // 5. Products with price >= 3
        $priceGreaterThanOrEqual = Product::where(
            'price',
            '>=',
            3
        )->get();

        // 6. Products in Electronics category
        $electronics = Product::whereHas(
            'category',
            function ($q) {
                $q->where('name', 'Electronics');
            }
        )->get();

        // ========================================
        // C. AGGREGATING DATA
        // ========================================

        // 7. Total price
        $totalPrice = Product::sum('price');

        // 8. Average price
        $averagePrice = Product::avg('price');

        // 9. Highest price
        $highestPrice = Product::max('price');

        // 10. Lowest price
        $lowestPrice = Product::min('price');

        // ========================================
        // D. GROUPING, FILTERING AND SORTING
        // ========================================

        // 11. Total price per category
        $totalPricePerCategory = Product::join(
            'categories',
            'products.category_id',
            '=',
            'categories.id'
        )
            ->select(
                'categories.name',
                DB::raw(
                    'SUM(products.price) as total_price'
                )
            )
            ->groupBy(
                'categories.id',
                'categories.name'
            )
            ->get();

        // 12. Average price per category
        $averagePricePerCategory = Product::join(
            'categories',
            'products.category_id',
            '=',
            'categories.id'
        )
            ->select(
                'categories.name',
                DB::raw(
                    'AVG(products.price) as avg_price'
                )
            )
            ->groupBy(
                'categories.id',
                'categories.name'
            )
            ->get();

        // 13. Lowest price per category
        $lowestPricePerCategory = Product::join(
            'categories',
            'products.category_id',
            '=',
            'categories.id'
        )
            ->select(
                'categories.name',
                DB::raw(
                    'MIN(products.price) as min_price'
                )
            )
            ->groupBy(
                'categories.id',
                'categories.name'
            )
            ->get();

        // 14. Average price sorted ascending
        $averagePriceSorted = Product::join(
            'categories',
            'products.category_id',
            '=',
            'categories.id'
        )
            ->select(
                'categories.name',
                DB::raw(
                    'AVG(products.price) as avg_price'
                )
            )
            ->groupBy(
                'categories.id',
                'categories.name'
            )
            ->orderBy('avg_price', 'asc')
            ->get();

        // 15. Average price for Electronics and Books
        $electronicsAndBooks = Product::join(
            'categories',
            'products.category_id',
            '=',
            'categories.id'
        )
            ->whereIn(
                'categories.name',
                ['Electronics', 'Books']
            )
            ->select(
                'categories.name',
                DB::raw(
                    'AVG(products.price) as avg_price'
                )
            )
            ->groupBy(
                'categories.id',
                'categories.name'
            )
            ->get();

        // ========================================
        // RETURN ALL RESULTS AS JSON
        // ========================================

        $queryResults = [
            'name_and_price' =>
                $nameAndPrice,

            'products_with_category' =>
                $productsWithCategory,

            'products_ordered_by_price' =>
                $productsOrderedByPrice,

            'first_five_products' =>
                $firstFiveProducts,

            'price_greater_than_or_equal' =>
                $priceGreaterThanOrEqual,

            'electronics' =>
                $electronics,

            'total_price' =>
                $totalPrice,

            'average_price' =>
                $averagePrice,

            'highest_price' =>
                $highestPrice,

            'lowest_price' =>
                $lowestPrice,

            'total_price_per_category' =>
                $totalPricePerCategory,

            'average_price_per_category' =>
                $averagePricePerCategory,

            'lowest_price_per_category' =>
                $lowestPricePerCategory,

            'average_price_sorted' =>
                $averagePriceSorted,

            'electronics_and_books' =>
                $electronicsAndBooks,
        ];

        return $this->success(
            'Query results retrieved successfully',
            $queryResults
        );
    }

    // ============================================
    // STORE - NOT REQUIRED IN THIS ACTIVITY
    // ============================================

    public function store(Request $request)
    {
        //
    }

    // ============================================
    // UPDATE - NOT REQUIRED IN THIS ACTIVITY
    // ============================================

    public function update(Request $request, string $id)
    {
        //
    }

    // ============================================
    // DELETE - NOT REQUIRED IN THIS ACTIVITY
    // ============================================

    public function destroy(string $id)
    {
        //
    }
}
