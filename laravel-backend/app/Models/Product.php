<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    // Preserve the existing primary key.
    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $keyType = 'int';

    // Existing fields + Product Catalog fields.
    protected $fillable = [
        'category_id',
        'code',
        'name',
        'description',
        'manufacturer',
        'photo',
        'price',
        'cost',
        'inventory_quantity',
    ];

    // Existing relationships.
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orders()
    {
        return $this->belongsToMany(
            Order::class,
            'order_products',
            'product_id',
            'order_id'
        )->withPivot('quantity');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function orderProducts()
    {
        return $this->hasMany(OrderProduct::class);
    }
}
