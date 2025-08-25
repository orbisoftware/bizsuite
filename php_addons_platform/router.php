<?php
// If the requested file exists, serve it
if (php_sapi_name() === 'cli-server') {
    $path = __DIR__ . parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
    if (is_file($path)) {
        return false;
    }
}

// Remove trailing slash
$uri = trim($_SERVER['REQUEST_URI'], '/');

// Default to index
if ($uri === '' || $uri === 'index') {
    require 'index.php';
    exit;
}

// Map to .php files
if (file_exists("$uri.php")) {
    require "$uri.php";
    exit;
}

// Fallback
http_response_code(404);
echo "Page not found.";
