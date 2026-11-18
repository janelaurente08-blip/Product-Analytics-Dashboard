
<?php

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'storage/*',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:5173',
    ],

    'allowed_headers' => ['*'],

    'supports_credentials' => true,
];
