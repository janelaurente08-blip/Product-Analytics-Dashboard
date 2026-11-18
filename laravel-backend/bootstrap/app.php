
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Register your V1 API routes
            Route::middleware('api')
                ->prefix('api/v1')
                ->group(__DIR__.'/../routes/api_v1.php');

            // Register future V2 API routes here if needed
            // Route::middleware('api')
            //     ->prefix('api/v2')
            //     ->group(__DIR__.'/../routes/api_v2.php');
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Enable Laravel Sanctum SPA cookie-based authentication
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
